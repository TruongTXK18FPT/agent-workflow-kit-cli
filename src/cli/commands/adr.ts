/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { ADRService } from "../../core/awos/adr.js";

interface CreateAdrOptions {
  title?: string;
  status?: 'proposed' | 'accepted' | 'rejected' | 'superseded';
  context?: string;
  decision?: string;
  consequences?: string;
  decisionMaker?: string;
}

export async function createAdrCommand(options: CreateAdrOptions) {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n📝 Creating New Architectural Decision Record (ADR)"));
  console.log(chalk.dim("------------------------------------------"));

  const title = options.title || "Decision Title";
  const status = options.status || "proposed";
  const context = options.context || "Explain the problem or background context.";
  const decision = options.decision || "Detail what will change and what decision is made.";
  const consequences = options.consequences || "What are the positive or negative consequences of this path?";
  const decisionMaker = options.decisionMaker || "AWOS System";

  const created = await ADRService.create(cwd, {
    title,
    status,
    context,
    decision,
    consequences,
    metadata: {
      decisionMakerRole: decisionMaker,
    },
  });

  console.log(chalk.bold.green(`\n🎉 ADR Created Successfully!`));
  console.log(`${chalk.bold("ID:")}      ${created.id}`);
  console.log(`${chalk.bold("File:")}    docs/adr/${created.id}.md`);
  console.log(`${chalk.bold("Title:")}   ${created.title}`);
  console.log(`${chalk.bold("Status:")}  ${created.status}\n`);
}

export async function listAdrsCommand() {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n📖 Architectural Decision Records (ADRs)"));
  console.log(chalk.dim("------------------------------------------"));

  const list = await ADRService.list(cwd);

  if (list.length === 0) {
    console.log(chalk.gray("No ADRs found under 'docs/adr/'."));
    return;
  }

  for (const adr of list) {
    let statusColor = chalk.yellow;
    if (adr.status === "accepted") statusColor = chalk.green;
    else if (adr.status === "rejected") statusColor = chalk.red;
    else if (adr.status === "superseded") statusColor = chalk.gray;

    console.log(`${chalk.bold.green(`- ${adr.id}`)}: ${adr.title} (${statusColor(adr.status)}) [${adr.date}]`);
    if (adr.metadata?.decisionMakerRole) {
      console.log(chalk.gray(`  Decision Maker: ${adr.metadata.decisionMakerRole}`));
    }
  }
  console.log("");
}

export async function showAdrCommand(id: string) {
  const cwd = process.cwd();
  const adr = await ADRService.load(cwd, id);

  let statusColor = chalk.yellow;
  if (adr.status === "accepted") statusColor = chalk.green;
  else if (adr.status === "rejected") statusColor = chalk.red;
  else if (adr.status === "superseded") statusColor = chalk.gray;

  console.log(chalk.bold.cyan(`\n🔍 ADR Details: ${adr.id}`));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`${chalk.bold("Title:")}        ${adr.title}`);
  console.log(`${chalk.bold("Date:")}         ${adr.date}`);
  console.log(`${chalk.bold("Status:")}       ${statusColor(adr.status)}`);
  if (adr.metadata?.decisionMakerRole) {
    console.log(`${chalk.bold("Role:")}         ${adr.metadata.decisionMakerRole}`);
  }
  console.log(chalk.dim("------------------------------------------"));
  
  console.log(chalk.bold("Context:"));
  console.log(`  ${adr.context}\n`);

  console.log(chalk.bold("Decision:"));
  console.log(`  ${adr.decision}\n`);

  console.log(chalk.bold("Consequences:"));
  console.log(`  ${adr.consequences}\n`);
  console.log(chalk.dim("------------------------------------------\n"));
}

export async function searchAdrsCommand(keyword: string) {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan(`\n🔎 Searching ADRs for keyword: '${keyword}'`));
  console.log(chalk.dim("------------------------------------------"));

  const results = await ADRService.search(cwd, keyword);

  if (results.length === 0) {
    console.log(chalk.yellow("No decisions found matching the keyword."));
    return;
  }

  console.log(chalk.green(`Found ${results.length} matching ADRs:\n`));
  for (const adr of results) {
    console.log(`${chalk.bold.green(`- ${adr.id}`)}: ${adr.title} (${adr.status})`);
  }
  console.log("");
}
