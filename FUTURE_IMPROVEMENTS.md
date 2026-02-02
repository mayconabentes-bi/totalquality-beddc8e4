# Future Improvements for Company Registration Feature

This document lists potential enhancements that could be added to the company registration feature in future iterations.

## 1. CEP Formatting and Validation
**Priority:** Medium
**Description:** Add automatic formatting for CEP (Brazilian postal code) field
- Apply mask: XXXXX-XXX
- Validate format (8 digits)
- Optional: Integration with ViaCEP API for address auto-completion

**Current State:** CEP is stored as plain text without validation

## 2. Phone Number Formatting
**Priority:** Medium
**Description:** Add automatic formatting for phone numbers
- Apply mask for mobile: (XX) XXXXX-XXXX
- Apply mask for landline: (XX) XXXX-XXXX
- Validate format and length

**Current State:** Phone is stored as plain text without validation

## 3. Company Logo Upload
**Priority:** Low
**Description:** Add functionality to upload and display company logos
- File upload interface
- Image preview
- Store in Supabase Storage
- Save URL in `logo_url` field

**Current State:** `logo_url` field exists but no UI to upload images

## 4. Address Auto-completion
**Priority:** Low
**Description:** Integrate with ViaCEP API to auto-fill address fields when CEP is entered
- Fetch address data when CEP is entered
- Auto-populate Logradouro, Bairro fields
- Reduce manual data entry

## 5. CNPJ Validation Algorithm
**Priority:** Low
**Description:** Implement full CNPJ validation algorithm (check digits)
- Validate check digits
- Prevent invalid CNPJ registration
- Better data quality

**Current State:** Only validates length (14 digits)

## 6. Company Editing
**Priority:** High
**Description:** Add ability to edit existing company data
- Edit button on company list items
- Populate modal with existing data
- Update instead of insert

**Current State:** Only creation is supported, no editing

## 7. Company Deletion
**Priority:** Medium
**Description:** Add ability to delete companies
- Delete confirmation dialog
- Handle foreign key constraints
- Soft delete option

## 8. Bulk Import
**Priority:** Low
**Description:** Import multiple companies from CSV/Excel
- File upload interface
- Data validation
- Bulk insert
- Error reporting

## 9. Export Functionality
**Priority:** Low
**Description:** Export companies list to CSV/Excel
- Filter options
- Column selection
- Date range

## 10. Advanced Search and Filters
**Priority:** Medium
**Description:** Add search and filter capabilities to companies list
- Search by name, CNPJ, etc.
- Filter by date range
- Sort by different fields

---

## Notes
- The current implementation focuses on the core requirements specified in the problem statement
- These improvements can be implemented incrementally in future sprints
- Priority is subjective and should be validated with product owner/stakeholders
