import { Command } from "commander";
import figlet from "figlet";
import OpenAI from "openai";
import * as readline from "readline/promises";

const HELP_HEADER = figlet.textSync("GPT English Coach") + "\n";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = (japanese: string, english: string): string => `\\
以下は生徒が作成した日本語文とその英作文だ。条件に従ってアドバイスを示せ。

// 条件
- 英作文の文法の間違いを指摘せよ
- 英作文の単語の意味やニュアンスの不適切な箇所を指摘せよ
- アドバイスに沿って英作文を修正せよ
- 日本語文に対する英作文の他の表現例を3個生成せよ
- 日本語文から長い文章を生成（2文追加）し、それに対する英作文を生成せよ

// 日本語
${japanese}

// 英作文
${english}

// 出力形式
### 文法の間違い
- [文法の間違い1]
- ...
### 単語の意味やニュアンスの不適切な箇所
- [単語の意味やニュアンスの不適切な箇所1]
- ...
### 修正例
[修正例]
### 他の表現例
- [他の表現例1]
- [他の表現例2]
- [他の表現例3]
### 長い日本語文
[日本語文]
### 長い英作文
[英作文]

// 出力`;

const run = async (japanese?: string, english?: string): Promise<void> => {
  if (!japanese || !english) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    japanese = await rl.question("日本語: ");
    english = await rl.question("英作文: ");
    rl.close();
  }

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "あなたは有能な英語コーチだ。" },
      { role: "user", content: prompt(japanese, english) },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.4,
  });

  console.log("アドバイス:");
  console.log(completion.choices[0].message.content);
};

const main = async (): Promise<void> => {
  await new Command("gpt-english-coach")
    .version("0.1.0")
    .addHelpText("beforeAll", HELP_HEADER)
    .argument("[japanese]", "日本語文")
    .argument("[english]", "英作文")
    .action(run)
    .showHelpAfterError(true)
    .showSuggestionAfterError(true)
    .parseAsync(process.argv);
};

main();
