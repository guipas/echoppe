const app = require('../app')({
  env : 'test',
  testConfig : {
    mongodbURI : process.env.ECHOPPE_TEST_MONGODBURI,
  }
});


beforeAll(() => {
  console.log('BEFORE');
});

afterAll(() => {
  console.log('AFTER');
});

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});