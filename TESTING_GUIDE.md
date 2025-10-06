# Testing Guide: Team Member Status & Project Filtering

## ✅ Database Migration Applied Successfully

Now let's test the new features to ensure everything is working correctly.

---

## Test Scenarios

### 1️⃣ Test: Add New Team Member

**Steps:**
1. Navigate to **Team Management** section
2. Click **"Add Member"** button
3. Fill in the form:
   - Name: "Test Member"
   - Role: Select any role
   - Email: "test@example.com"
   - Department: Select any department
4. Notice: **No status field appears** (this is correct!)
5. Click **"Add Member"**

**Expected Result:**
- ✅ New member is created successfully
- ✅ Member appears in the list with **no "Inactive" badge**
- ✅ Member has **indigo avatar** (not gray)
- ✅ Card has normal opacity (not faded)

---

### 2️⃣ Test: Edit Team Member Status to Inactive

**Steps:**
1. Find the team member you just created
2. Click the **Edit (pencil)** icon
3. Notice: **Status dropdown now appears** in the form
4. Change status from **"Active"** to **"Inactive"**
5. Click **"Update Member"**

**Expected Result:**
- ✅ Status dropdown is visible (only in edit mode)
- ✅ Member is updated successfully
- ✅ Member now shows **"Inactive" badge** next to their name
- ✅ Avatar background changes to **gray** (instead of indigo)
- ✅ Entire card has **60% opacity** (faded appearance)

---

### 3️⃣ Test: Inactive Members Hidden in Allocation Form

**Steps:**
1. Navigate to **Monthly Allocation View** or **Allocation Form**
2. Click to create a **new allocation**
3. Open the **Team Member dropdown**
4. Check the list of available members

**Expected Result:**
- ✅ **Inactive members do NOT appear** in the dropdown
- ✅ Only **active members** are listed
- ✅ The test member you made inactive is **not visible**

---

### 4️⃣ Test: Completed Projects Hidden in Allocation Form

**Steps:**
1. Go to **Project Management**
2. Edit any project and set its status to **"Completed"**
3. Save the project
4. Go back to **Allocation Form**
5. Open the **Project dropdown**

**Expected Result:**
- ✅ **Completed projects do NOT appear** in the dropdown
- ✅ Only projects with status: Planning, Active, On Hold, or Cancelled are shown
- ✅ The completed project is **not visible**

---

### 5️⃣ Test: Reactivate Team Member

**Steps:**
1. Go back to **Team Management**
2. Find the inactive member (with gray avatar and "Inactive" badge)
3. Click **Edit**
4. Change status from **"Inactive"** to **"Active"**
5. Click **"Update Member"**

**Expected Result:**
- ✅ Member is updated successfully
- ✅ **"Inactive" badge disappears**
- ✅ Avatar background changes back to **indigo**
- ✅ Card opacity returns to **normal** (100%)
- ✅ Member **reappears** in allocation form dropdown

---

### 6️⃣ Test: Database Persistence

**Steps:**
1. Make a member inactive
2. Refresh the browser page (F5)
3. Check if the member is still showing as inactive

**Expected Result:**
- ✅ Status persists after page reload
- ✅ Inactive member still shows with badge and gray styling
- ✅ Still hidden from allocation dropdown

---

### 7️⃣ Test: Visual Indicators

**Check the Team Management page for visual differences:**

**Active Member:**
- Regular opacity (100%)
- Indigo/purple avatar circle
- No status badge
- Name displayed normally

**Inactive Member:**
- Reduced opacity (60% - appears faded)
- Gray avatar circle
- Small "Inactive" badge next to name
- Still editable and deletable

---

## 🐛 Troubleshooting

### Issue: Status field doesn't appear when editing
**Solution:** Make sure you're clicking Edit on an existing member, not adding a new one

### Issue: Inactive members still appear in allocation dropdown
**Solution:** 
1. Check if the member's status is actually set to "inactive" in the database
2. Refresh the page to reload data
3. Check browser console for errors

### Issue: Status doesn't persist after save
**Solution:**
1. Verify the SQL migration was run successfully
2. Check Supabase logs for errors
3. Verify the `status` column exists in `team_members` table

---

## 📊 Verification Queries (Optional)

Run these in Supabase SQL Editor to verify data:

```sql
-- Check if status column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'team_members' 
ORDER BY ordinal_position;

-- View all team members with their status
SELECT id, name, role, status 
FROM team_members 
ORDER BY name;

-- Count active vs inactive members
SELECT status, COUNT(*) 
FROM team_members 
GROUP BY status;
```

---

## ✅ Success Criteria

All features are working correctly if:

- ✅ New members default to "active" status
- ✅ Status dropdown only appears when editing (not when adding)
- ✅ Inactive members have visual indicators (gray, badge, faded)
- ✅ Allocation form only shows active members
- ✅ Allocation form doesn't show completed projects
- ✅ Status changes persist after page reload
- ✅ Status can be toggled between active/inactive

---

## 🎉 Congratulations!

If all tests pass, your team member status feature is fully functional! You can now:
- Mark team members as inactive when they leave or are on extended leave
- Keep your allocation dropdowns clean with only active members
- Maintain a complete history while hiding inactive members from day-to-day operations
- Easily reactivate members when needed

---

## Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify the SQL migration was applied correctly
4. Ensure you've refreshed the page after making changes
