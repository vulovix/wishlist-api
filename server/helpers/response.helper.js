module.exports = {
  Ok: { status: 200, message: "" },
  Unauthorized: { status: 403, message: "Unauthorized" },
  NotFound: { status: 404, message: "Not Found" },
  UsernameOccupied: { status: 403, message: "User with such Username already exists." },
  EmailOccupied: { status: 403, message: "User with such E-mail already exists." },
  TooManyConnections: (time) => ({ status: 429, message: "Too Many Requests are failed. Your IP has been blocked. Try again in " + time + " minutes." }),
  TooManyIncorrectLoginAttempts: (time) => ({ status: 429, message: "Too Many Incorrect Login Attempts. Try again in " + time + " minutes." })
}