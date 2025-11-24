import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "json-schema-to-typescript";

async function generateTypes() {
  const schemaPath = join(__dirname, "../schema/invoice.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

  const types = await compile(schema, "InvoiceSchemaRequest", {
    bannerComment: "",
    style: {
      singleQuote: true,
      semi: true,
    },
  });

  const outputPath = join(__dirname, "../src/types/invoiceSchema.ts");
  writeFileSync(outputPath, types);
  console.log(`Generated types at ${outputPath}`);
}

generateTypes().catch(console.error);
