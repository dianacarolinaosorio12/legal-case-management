# Sprint 1 E2E Test PRD

## Test Scenarios

### 1. Login and Create Case
- **Description**: Login as student and create a new legal case
- **Steps**:
  1. Navigate to http://localhost:3000/login
  2. Fill email: mgonzalez@universidad.edu.co
  3. Fill password: password123
  4. Click Login button
  5. Verify redirect to /dashboard
  6. Navigate to /dashboard/nuevo-caso
  7. Fill form with:
     - Case type: Tutela
     - Area: Civil
     - Client name: Test User
     - Client doc: 12345678
     - Client phone: 3001234567
     - Client email: test@email.com
  8. Fill interview notes
  9. Click Create button
  10. Confirm in dialog

### 2. Calendar Event Verification  
- **Description**: Verify calendar shows events with correct colors
- **Steps**:
  1. After creating case, navigate to /dashboard/calendario
  2. Verify calendar loads
  3. Verify events are displayed
  4. Verify colors: red (<2 days), yellow (<5 days), green (>5 days)

### 3. Document Upload
- **Description**: Upload PDF document to case
- **Steps**:
  1. Navigate to case detail
  2. Click upload button
  3. Select PDF file
  4. Verify file appears in list

## Expected Results
- Login succeeds and redirects to dashboard
- Case is created with auto-calculated deadlines
- Calendar shows events with color coding
- Document upload works and shows in list
