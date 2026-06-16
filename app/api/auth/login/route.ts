import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { ok, badRequest, handleError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return badRequest("Invalid email or password");
    }

    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return ok({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    return handleError(err);
  }
}
