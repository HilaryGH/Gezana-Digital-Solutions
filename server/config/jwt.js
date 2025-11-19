const DEFAULT_JWT_SECRET = "dev_jwt_secret_change_me";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET is not set. Falling back to a development default. " +
      "Please configure JWT_SECRET in your environment for production."
  );
}

module.exports = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;














