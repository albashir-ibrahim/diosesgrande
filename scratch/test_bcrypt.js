
const bcrypt = require('bcryptjs');

async function test() {
  const password = 'Password123!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
  
  const matchWrong = await bcrypt.compare('WrongPassword', hash);
  console.log('Match Wrong:', matchWrong);
}

test();
