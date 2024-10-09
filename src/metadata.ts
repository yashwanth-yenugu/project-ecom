/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./models/signIn.dto"), { "SignInDto": { email: { required: true, type: () => String, example: "yash@mail.in" }, password: { required: true, type: () => String, example: "admin" } } }], [import("./models/signUp.dto"), { "SignUpDto": { name: { required: true, type: () => String, example: "yash" } } }]], "controllers": [[import("./app.controller"), { "AppController": { "getHello": {}, "getProfile": { type: Object }, "getAllUsers": {}, "gettest": { type: Object } } }], [import("./auth/auth.controller"), { "AuthController": { "login": { type: Object }, "signUp": {}, "refresh": { type: Object } } }]] } };
};