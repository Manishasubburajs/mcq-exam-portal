import bcrypt from "bcryptjs";

//give your password

 const password = "Manisha@123";
//const password = "your password";

const hashPassword = async () => {
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
};

hashPassword();
