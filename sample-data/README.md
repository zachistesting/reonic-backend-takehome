# Sample Invoice Data

This directory contains sample invoices that conform to the JSON schema defined in `../schema/invoice.schema.json`.

## Files

- `invoice-001.json` - Paid invoice for Solar Energy GmbH (solar installation)
- `invoice-002.json` - Sent invoice for GreenTech Solutions AG (energy management system)
- `invoice-003.json` - Overdue invoice for Müller Energietechnik (battery storage)
- `invoice-004.json` - Draft invoice for Schmidt Immobilien GmbH (energy audit)
- `invoice-005.json` - Sent invoice for Solar Energy GmbH (maintenance service)

## Usage

You can use these sample files to:
- Test your invoice import/creation endpoint
- Validate your JSON schema validation
- Test your search and retrieval functionality
- Populate your database with initial test data

## Notes

- Multiple invoices are from the same customer (Solar Energy GmbH) to test customer-based queries
- Invoices span different dates to test date-range queries
- Different statuses are represented to test status filtering
- All monetary values are in EUR (Euros)
- Addresses are German/Swiss locations as Reonic operates in the DACH region
