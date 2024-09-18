/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./auth/models/signIn.dto"), { "SignInDto": { username: { required: true, type: () => String, example: "yash" }, password: { required: true, type: () => String, example: "admin" } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String }, "getProfile": { type: Object } } }], [import("./auth/auth.controller"), { "AuthController": { "login": {} } }]] } };
};