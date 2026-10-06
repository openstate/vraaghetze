import { writeFileSync } from 'fs';

// When running e2e tests console.log statements cannot be used to debug failing scenarios because the output
// disappears. Until we have a solution for that, use `writeTestLog` instead of console.log.
export const writeTestLog = (message: string) => {
	if (process.env.ENV !== 'testing') return;

	writeFileSync('./test-results/test.log', `${message}\n`, { flag: 'a' });
}