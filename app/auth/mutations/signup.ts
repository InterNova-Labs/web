import { AuthenticationError, resolver, SecurePassword } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"
import { Role } from "db"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, password, name, description, logo, website }, ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim())
    const user = await db.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, role: true },
    })

    if (user) {
      const company = await db.company.findFirst({
        where: {
          userId: user.id,
        },
        select: { id: true },
      })

      const intern = await db.intern.findFirst({
        where: {
          userId: user.id,
        },
        select: { id: true },
      })

      if (company) {
        const companyError = new AuthenticationError("Company already exists")
        companyError.name = "COMPANY_EXISTS"

        throw companyError
      } else if (intern) {
        const internError = new AuthenticationError("Intern already exists")
        internError.name = "USER_IS_INTERN"

        throw internError
      } else {
        await db.company.create({
          data: { id: user.id, name, description, logo, website, userId: user.id },
          select: { id: true, name: true },
        })
        return user
      }
    } else {
      const createdUser = await db.user.create({
        data: {
          email: email.toLowerCase().trim(),
          hashedPassword,
          role: "COMPANY",
        },
      })

      // we don't need data from the company since the user and company id are the same
      await db.company.create({
        data: { id: createdUser.id, name, description, logo, website, userId: createdUser.id },
        select: { id: true, name: true },
      })

      await ctx.session.$create({ userId: createdUser.id, role: createdUser.role as Role })
      return user
    }
  }
)
