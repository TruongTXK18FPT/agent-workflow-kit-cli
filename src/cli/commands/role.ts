/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import path from "path";
import { RoleRegistry } from "../../core/awos/registry.js";

const DEFAULT_ROLES_DIR = ".agents/roles";

export async function listRoles() {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n👥 Discovered Agent Role Catalog"));
  console.log(chalk.dim("------------------------------------------"));

  const dir = path.join(cwd, DEFAULT_ROLES_DIR);
  const list = await RoleRegistry.discover(dir);

  if (list.length === 0) {
    console.log(chalk.gray(`No roles found under '${DEFAULT_ROLES_DIR}/'.`));
    return;
  }

  for (const role of list) {
    console.log(`${chalk.bold.green(`- ${role.id}`)}: ${role.name}`);
    console.log(chalk.gray(`  ${role.description}\n`));
  }
}

export async function showRole(id: string) {
  const cwd = process.cwd();
  const dir = path.join(cwd, DEFAULT_ROLES_DIR);
  const role = await RoleRegistry.load(id, dir);

  console.log(chalk.bold.cyan(`\n🔍 Agent Role: ${role.id}`));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`${chalk.bold("Name:")}        ${role.name}`);
  console.log(`${chalk.bold("Description:")} ${role.description}`);
  console.log(chalk.dim("------------------------------------------"));
  
  console.log(chalk.bold("Responsibilities:"));
  for (const resp of role.responsibilities) {
    console.log(`  - ${resp}`);
  }
  
  console.log(chalk.bold("\nRequired Inputs:"));
  for (const inp of role.requiredInputs) {
    console.log(`  - ${inp}`);
  }

  console.log(chalk.bold("\nExpected Outputs:"));
  for (const out of role.expectedOutputs) {
    console.log(`  - ${out}`);
  }

  console.log(chalk.bold("\nValidation Checklist:"));
  for (const item of role.validationChecklist) {
    console.log(`  - ${item}`);
  }

  console.log(chalk.bold("\nReview Checklist:"));
  for (const item of role.reviewChecklist) {
    console.log(`  - ${item}`);
  }
  console.log(chalk.dim("------------------------------------------\n"));
}

export async function validateRoles() {
  const cwd = process.cwd();
  const dir = path.join(cwd, DEFAULT_ROLES_DIR);
  
  try {
    const list = await RoleRegistry.discover(dir);
    if (list.length === 0) {
      console.log(chalk.yellow(`No roles discovered to validate under '${DEFAULT_ROLES_DIR}/'.`));
      return;
    }
    for (const role of list) {
      RoleRegistry.validate(role);
      console.log(chalk.green(`✔️ Role '${role.id}' is schema valid.`));
    }
    console.log(chalk.bold.green(`\n🎉 All ${list.length} agent roles validated successfully!`));
  } catch (err) {
    console.error(chalk.bold.red(`\n❌ Agent Role validation failed:`));
    console.error(chalk.red(`  ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}
