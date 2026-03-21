import bcrypt from 'bcryptjs';

const password = 'modern123';  // your plain password
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(password, saltRounds);
console.log('Hashed password:', hashedPassword);
