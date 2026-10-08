// Use this file to create some text in a different encoding, which you can then use
// in bin/send_answer to check parsing of simulated incoming mails via Sendgrid
// containing different encodings.
//
// To check:
// - cat latin1_text.txt (will show the black question marks, standing for "ef bf bd" = UTF8 replacement character)
// - file -bi latin1_text.txt
// - iconv -f WINDOWS-1252 -t UTF8 latin1_text.txt (will show accented e's)
import { writeFileSync} from 'fs';

const text = "Dit is zo\xB4n antwoord met h\xE9\xE9l vreemde tekens";

console.info(text);

writeFileSync('./latin1_text.txt', text, { encoding: 'latin1'});
