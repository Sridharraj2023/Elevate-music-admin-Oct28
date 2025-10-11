# 📋 How to Set Disclaimer by Admin - Complete Guide

## 🎯 **Step-by-Step Instructions:**

### **Step 1: Access Admin Panel**
1. **Open your browser** and go to: `http://localhost:5173/admin`
2. **Login** with your admin credentials
3. **Navigate** to the dashboard

### **Step 2: Find Terms & Conditions Management**
1. On the admin dashboard, look for **"Manage Terms & Conditions"** section
2. Click on **"Terms & Conditions"** card/button
3. This will take you to the Terms management page

### **Step 3: Create New Disclaimer**
1. Click the **"Create New Terms & Conditions"** button
2. Fill out the form:
   - **Version:** `1.0` (or `1.1`, `2.0`, etc.)
   - **Effective Date:** `2025-01-10` (today's date)
   - **Content:** Copy the HTML content below

### **Step 4: Add Content**
Copy and paste this HTML content into the content field:

```html
<h1>Elevate App – Terms & Conditions</h1>

<p><strong>Effective Date:</strong> January 10, 2025<br>
<strong>Last Updated:</strong> October 11, 2025</p>

<p>Welcome to Elevate App, operated by Elevate Audioworks LLC ("Company," "we," "our," or "us"). These Terms & Conditions ("Terms") govern your use of the Elevate App, our website(s), and related services (collectively, the "Services"). By using our Services, you agree to these Terms. If you do not agree, you may not use the Services.</p>

<h2>1. Eligibility</h2>
<ul>
<li>You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use the Services.</li>
<li>If you are under 18, you represent that you have permission from a parent or legal guardian.</li>
</ul>

<h2>2. Accounts</h2>
<ul>
<li>To access certain features, you may need to create an account.</li>
<li>You agree to provide accurate, complete information and keep it updated.</li>
<li>You are responsible for maintaining the confidentiality of your login credentials and all activity under your account.</li>
</ul>

<h2>3. Use of Services</h2>
<ul>
<li>The Services are provided for personal, non-commercial use unless otherwise agreed in writing.</li>
<li>You agree not to:
  <ul>
    <li>Copy, modify, distribute, or reverse-engineer the Services.</li>
    <li>Use the Services in violation of any law or regulation.</li>
    <li>Attempt to gain unauthorized access to any systems or networks.</li>
  </ul>
</li>
</ul>

<h2>4. Intellectual Property</h2>
<ul>
<li>All content, software, design, trademarks, and related intellectual property in the Services are owned by Elevate Audioworks LLC or its licensors.</li>
<li>You are granted a limited, non-exclusive, revocable license to use the Services solely as permitted under these Terms.</li>
</ul>

<h2>5. User Content</h2>
<ul>
<li>If you submit content (such as comments, suggestions, or other materials), you grant us a non-exclusive, royalty-free license to use, display, and distribute it as necessary to operate the Services.</li>
<li>You retain all rights to your content.</li>
</ul>

<h2>6. Privacy & Data</h2>
<ul>
<li>We respect your privacy. We do not sell your personal data to third parties.</li>
<li>Our collection and use of data pertains to app functionality and is described in our Privacy Policy (separate document).</li>
</ul>

<h2>7. Subscriptions & Payments</h2>
<ul>
<li>Certain features may require payment or a subscription.</li>
<li>All payments are processed through authorized third-party providers.</li>
<li>Yearly subscriptions are billed in full at the time of purchase and are non-refundable.</li>
<li>Monthly subscriptions may be canceled at any time, but fees already paid are non-refundable.</li>
<li>Subscriptions automatically renew at the end of each billing cycle (monthly or yearly) unless canceled at least 24 hours before the renewal date.</li>
<li>It is your responsibility to manage your subscription through your account settings or the platform where you purchased (e.g., Apple App Store, Google Play).</li>
</ul>

<h2>8. Disclaimers</h2>
<ul>
<li>The Services are provided "as is" and "as available," without warranties of any kind, express or implied.</li>
<li>We do not guarantee that the Services will be uninterrupted, error-free, or free from harmful components.</li>
<li>Binaural audio and related content are for wellness and entertainment purposes only. They are not medical advice and should not be used as a substitute for professional healthcare.</li>
</ul>

<h2>9. Limitation of Liability</h2>
<ul>
<li>To the fullest extent permitted by law, Elevate Audioworks LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Services.</li>
<li>Our total liability for any claim shall not exceed the amount you paid (if any) in the 12 months prior to the claim.</li>
</ul>

<h2>10. Termination</h2>
<ul>
<li>We may suspend or terminate your account if you violate these Terms or misuse the Services.</li>
<li>You may delete your account at any time.</li>
</ul>

<h2>11. Governing Law</h2>
<ul>
<li>These Terms shall be governed by and construed under the laws of the State of Minnesota, without regard to conflict of law principles.</li>
<li>Any disputes shall be resolved exclusively in the state or federal courts located in Hennepin County, Minnesota.</li>
</ul>

<h2>12. Changes to Terms</h2>
<ul>
<li>We may update these Terms from time to time. Changes will be effective when posted.</li>
<li>Continued use of the Services means you accept the updated Terms.</li>
</ul>
```

### **Step 5: Preview & Publish**
1. Click **"Preview"** to see how it will look
2. If it looks good, click **"Publish"** to make it live
3. The disclaimer will now be active in your app

---

## 🎯 **Visual Guide:**

```
Admin Dashboard
├── Manage Terms & Conditions ← Click here
    ├── Create New Terms & Conditions ← Click here
    ├── Fill Form:
    │   ├── Version: 1.0
    │   ├── Effective Date: 2025-01-10
    │   └── Content: [Paste HTML above]
    ├── Preview ← Check formatting
    └── Publish ← Make it live!
```

---

## ✅ **What Happens After Publishing:**

### **Immediate Effects:**
- ✅ Disclaimer becomes active in Flutter app
- ✅ Users see it when clicking "Terms & Conditions" on login
- ✅ Professional formatting with headings and lists
- ✅ Mobile-responsive display

### **Admin Controls:**
- ✅ Edit existing terms anytime
- ✅ Create new versions
- ✅ Unpublish if needed
- ✅ View all versions history

---

## 🧪 **Testing After Setup:**

### **1. Test Flutter App:**
1. Open your Flutter app
2. Go to Login screen
3. Tap "Terms & Conditions" link
4. Verify disclaimer displays correctly

### **2. Test Mobile Display:**
1. Check formatting on mobile
2. Verify scrolling works
3. Test back button functionality

---

## 🚨 **Important Notes:**

### **Version Management:**
- **Version Numbers:** Use semantic versioning (1.0, 1.1, 2.0)
- **Effective Dates:** Set when terms become active
- **Publishing:** Only published terms are visible to users

### **Content Guidelines:**
- **HTML Formatting:** Use proper HTML tags for formatting
- **Length:** Keep content concise but comprehensive
- **Updates:** Change version number when updating content

---

## 🎊 **You're Done!**

**Once you publish the disclaimer:**
- ✅ It's live in your Flutter app
- ✅ Users can access it from login screen
- ✅ Professional formatting applied
- ✅ Mobile-responsive design
- ✅ Easy to update anytime

**Just follow the steps above and your disclaimer will be set up in minutes!** 🚀
