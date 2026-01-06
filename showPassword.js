import bcrypt from "bcryptjs";

const password = "Manisha@123"; // EXACT password
const hash = "$2b$10$1UOwFQpkzXkCB7o8oT1pOONbYUazKtv6itwN4sx7f8o6NHjV7QsUO";

bcrypt.compare(password, hash).then(console.log);
