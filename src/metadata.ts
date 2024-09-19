/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./models/signIn.dto"), { "SignInDto": { email: { required: true, type: () => String, example: "yash@mail.in" }, password: { required: true, type: () => String, example: "admin" } } }], [import("./models/signUp.dto"), { "SignUpDto": { username: { required: true, type: () => String, example: "yash" } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": { type: String }, "getProfile": { type: Object } } }], [import("./auth/auth.controller"), { "AuthController": { "login": {}, "signUp": {} } }]] } };
};