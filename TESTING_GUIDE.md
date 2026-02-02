# Testing & Verification Guide

## Quick Start Testing

### Prerequisites
1. Database migration must be applied
2. At least 2 users in the system (one master/proprietario and one other role)
3. Access to the Supabase database to verify changes

### Test Scenario 1: Configure User Access (Happy Path)

**As Master/Proprietario User:**

1. Navigate to `/configuracoes` (Settings)
2. Scroll to "Gestão de Equipe" section
3. Verify checkboxes appear next to each team member
4. Select 2 team members by clicking their checkboxes
5. Verify "Configurar Acessos e Delegação" button becomes active
6. Verify button shows count badge (e.g., "2")
7. Click the button

**Expected:** Modal opens with 3 blocks

8. In Block 1, toggle ON: Gestão de Riscos and NPS
9. In Block 2, toggle ON: Pode Editar and Pode Exportar
10. In Block 3, select a company from dropdown
11. Click "Salvar Configurações"

**Expected Results:**
- Success toast: "Acessos configurados para 2 usuário(s)"
- Modal closes
- Checkboxes reset to unchecked
- Database updated for both users

**Database Verification:**
```sql
SELECT id, full_name, role, active_modules, user_permissions, company_id
FROM profiles
WHERE id IN ('user_id_1', 'user_id_2');
```

Expected JSON structure:
```json
{
  "active_modules": {
    "axioma_mercado": false,
    "axioma_estatistica": false,
    "gestao_riscos": true,
    "nps": true,
    "manutencao": false
  },
  "user_permissions": {
    "pode_editar": true,
    "pode_deletar": false,
    "pode_exportar": true
  }
}
```

### Test Scenario 2: Module Access Control

**Setup:**
1. Configure a test user with only NPS module active
2. Log in as that test user

**Test Steps:**
1. Navigate to `/dashboard`
2. Verify only NPS module card is visible
3. Verify Gestão de Riscos and Manutenção cards are hidden

**Expected:** Only modules in active_modules=true are shown

**Direct URL Access Test:**
1. While logged in as restricted user
2. Try to navigate to `/riscos` directly in browser

**Expected:**
- Redirect to `/upgrade` page
- Toast message: "Módulo não contratado. Faça upgrade do seu plano."
- Upgrade page displays with proper UI

### Test Scenario 3: Master Override

**As Master User:**
1. Navigate to `/dashboard`
2. Verify ALL module cards are visible (regardless of active_modules)
3. Navigate directly to `/riscos`, `/manutencao`, `/nps`

**Expected:** Master has access to all routes and all modules appear

### Test Scenario 4: Validation Checks

**Empty Selection Test:**
1. Go to Settings
2. Don't select any users
3. Click "Configurar Acessos e Delegação"

**Expected:** 
- Error toast: "Selecione pelo menos um usuário"
- Modal doesn't open

**Missing Company Test:**
1. Select users
2. Open modal
3. Leave company dropdown empty
4. Click "Salvar Configurações"

**Expected:**
- Error toast: "Selecione uma empresa para delegação"
- Changes not saved

### Test Scenario 5: Bulk Operations

**Setup:** Create 5 test users

**Test Steps:**
1. Select all 5 users
2. Configure same settings for all
3. Save

**Expected:**
- All 5 users updated simultaneously
- Success message shows correct count
- Database shows identical configurations

**Verification Query:**
```sql
SELECT id, full_name, active_modules, user_permissions 
FROM profiles 
WHERE id IN (/* your 5 user IDs */)
ORDER BY full_name;
```

## Edge Cases to Test

### Edge Case 1: User with No Company
**Test:** User exists but company_id is null
**Expected:** Modal shows empty dropdown, requires selection

### Edge Case 2: Master Configuring Another Master
**Test:** Select a master user and try to configure
**Expected:** Works normally, but master will still have full access

### Edge Case 3: Self-Configuration
**Test:** User tries to configure their own access
**Expected:** Works, but careful - could lock yourself out

### Edge Case 4: Network Failure
**Test:** Disconnect network during save
**Expected:** Error toast, no partial updates

### Edge Case 5: Concurrent Modifications
**Test:** Two admins modify same user simultaneously
**Expected:** Last write wins (Supabase behavior)

## UI/UX Verification Checklist

### Settings Page
- [ ] Checkboxes aligned properly with user items
- [ ] Button disabled state is visually clear
- [ ] Button count badge updates in real-time
- [ ] User list scrolls if many users
- [ ] Responsive on mobile devices

### Access Modal
- [ ] Modal scrolls if content overflows
- [ ] Switches animate smoothly
- [ ] All labels readable and clear
- [ ] Company dropdown shows proper formatting
- [ ] Cancel button works without saving
- [ ] Modal closes on backdrop click
- [ ] Modal closes on ESC key

### Dashboard
- [ ] Module cards don't leave empty spaces
- [ ] Grid adjusts properly with fewer cards
- [ ] No "flash" of hidden modules on load
- [ ] Smooth transitions when modules hide/show

### Upgrade Page
- [ ] Lock icon displays correctly
- [ ] All text is readable
- [ ] Buttons navigate to correct pages
- [ ] Page centers on all screen sizes
- [ ] Premium features list is visible

## Performance Testing

### Load Test
1. Create 50+ team members
2. Select all
3. Measure save time

**Expected:** Completes in <5 seconds

### Rendering Test
1. Fast 3G throttling
2. Navigate to Settings
3. Measure initial render

**Expected:** <3 seconds for interactive

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Security Verification

### Auth Tests
1. Try accessing `/configuracoes` without login
   - **Expected:** Redirect to `/auth`

2. Try accessing as non-master/proprietario
   - **Expected:** Redirect to `/dashboard`

3. Try accessing protected module URL directly
   - **Expected:** Redirect to `/upgrade` if module inactive

### SQL Injection Test
1. Try entering SQL in company selector
   - **Expected:** Treated as string, no execution

### XSS Test
1. Try entering `<script>alert('xss')</script>` in selections
   - **Expected:** Sanitized, no execution

## Rollback Plan

If issues occur:

1. **Revert Database:**
```sql
-- Remove columns
ALTER TABLE profiles DROP COLUMN IF EXISTS active_modules;
ALTER TABLE profiles DROP COLUMN IF EXISTS user_permissions;
```

2. **Revert Code:**
```bash
git revert HEAD~4..HEAD
git push origin copilot/update-settings-page-ui --force-with-lease
```

3. **Clear User Sessions:**
```sql
-- Force re-login for all users
DELETE FROM auth.sessions;
```

## Monitoring

After deployment, monitor:

1. **Error Rates:**
   - Check for spikes in 403/401 errors
   - Monitor toast error frequencies

2. **Performance:**
   - Dashboard load time
   - Settings page interaction time
   - Database query performance

3. **User Behavior:**
   - How many users configure access
   - Which modules are most restricted
   - Upgrade page visit rate

## Success Metrics

Consider implementation successful when:
- [ ] 0 TypeScript errors
- [ ] 0 security vulnerabilities
- [ ] <3s page load time
- [ ] <2s configuration save time
- [ ] 100% of module access respected
- [ ] All test scenarios pass
- [ ] No production errors in first 24h

## Support Documents

- Full implementation details: `IMPLEMENTATION_ACCESS_CONTROL.md`
- UI mockups: `UI_ACCESS_CONTROL_GUIDE.md`
- Database schema: `supabase/migrations/20260202012200_add_access_control_fields.sql`

## Known Limitations

1. **No Audit Trail:** Changes aren't logged (consider adding in future)
2. **No Undo:** Once saved, must manually reconfigure
3. **No Templatesutes:** Each configuration is manual
4. **No Time-based Access:** Access is permanent until changed
5. **No Notification:** Users aren't notified of access changes

## Future Enhancements

Consider adding:
1. Activity log for permission changes
2. Permission templates/presets
3. Email notifications on access changes
4. Time-limited access grants
5. Approval workflow for sensitive modules
6. Export/import user configurations
7. Bulk operations via CSV
8. Permission inheritance from groups
