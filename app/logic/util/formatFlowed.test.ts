import { convertFormatFlowedToHTML } from './formatFlowed';
import formatHTML from 'html-formatter';
import { expect, test } from 'vitest';
// @vitest-environment happy-dom

const testMails = [
  {
    html: `
  <html xmlns="http://www.w3.org/1999/xhtml"><body><p>Fred wrote on 19.12.2024, 11:50:</p>
  <blockquote type="cite"><blockquote type="cite"><p>Yes, that time works for me. Thanks! dfgd sfggsjhj gd lsglskdhg öshdkjgfh sdglkjsdg kshdlkjfgh slkjdhg lkjsdglkj hdsflkjgh slkjhglkjdsh gj ahfgökjh aflgh alkjhg lkjag lkjhadsökjgh adfghkjdg lkjh dgflkh dflkjgh dslhglkjsdhg lkdhgk shdflkjgk</p></blockquote><p>Added to my calendar.
</p></blockquote>
<p>ditto</p><p>Here's some ASCII-art for you:</p>
<p>


============== ============ ============ ============ =========<br>
============== ============ ============ ============ =========<br>
============== ============ ============ ============ =========<br>

</p><blockquote type="cite"><blockquote type="cite">
<p>What's your name? I tried, but couldn't find you based 
on your name Dshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsd DshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsdDshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsdDshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsd</p></blockquote><p>fred</p></blockquote><p>It works. Feel free to create branches, if you prefer.</p>
<p></p><p>From Marcha</p></body></html>`,
    formatFlowed: `Fred wrote on 19.12.2024, 11:50:
>> Yes, that time works for me. Thanks! dfgd sfggsjhj gd lsglskdhg 
>> öshdkjgfh sdglkjsdg kshdlkjfgh slkjdhg lkjsdglkj hdsflkjgh slkjhglkjdsh 
>> gj ahfgökjh aflgh alkjhg lkjag lkjhadsökjgh adfghkjdg lkjh dgflkh 
>> dflkjgh dslhglkjsdhg lkdhgk shdflkjgk
>
> Added to my calendar.

ditto
Here's some ASCII-art for you:
============== ============ ============ ============ =========<br>
============== ============ ============ ============ =========<br>
============== ============ ============ ============ =========<br>

>> What's your name? I tried, but couldn't find you based on your name 
>> Dshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsd 
>> DshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsdDshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsdDshgsdgsgsdfsdgfhfgjdsghfghjahjgsfhjhjydfhgskdgfkgfkgkhgsdkfhgsd
>
> fred

It works. Feel free to create branches, if you prefer.

 From Marcha
`,
  }
];

test("Convert HTML to format=flowed", () => {
});

test("Convert format=flowed to HTML", () => {
  for (let testMail of testMails) {
    let html = convertFormatFlowedToHTML(testMail.formatFlowed, null);
    expect(formatHTML.render(html)).toBe(formatHTML.render(testMail.html));
  }
});
