import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      landing: {
        nav: {
          login: "LOGIN",
          register: "REGISTER",
        },
        hero: {
          badge: "AI-POWERED PHISHING SIMULATION PLATFORM",
          title1: "Test Your Team's Resilience",
          title2: "Against ",
          words: ["Phishing", "Social Engineering", "Cyber Attack"],
          desc: "Create AI phishing simulations, send them to all departments, and see who clicks all in one intuitive dashboard. Free to try.",
          btn_start: "Get Started",
          btn_how_it_works: "See How It Works ↓"
        },
        stats: {
          delivery: "Delivery Rate",
          templates: "Ready Templates",
          setup: "Campaign Setup",
          monitor: "Monitoring",
          seconds: " sec"
        },
        features: {
          title: "Why Choose PhiSim?",
          desc: "Three key features that make phishing simulation as easy as ordering coffee.",
          items: [
            {
              title: "AI Email Generator",
              desc: "Just specify a theme AI will generate realistic phishing emails complete with decoy landing pages. Zero effort."
            },
            {
              title: "Custom HTML Engine",
              desc: "Have your own design? Upload your custom HTML decoy file and the system will process login forms automatically."
            },
            {
              title: "Real-Time Analytics",
              desc: "Monitor who opened emails, clicked links, or submitted sensitive data directly from an interactive dashboard."
            },
            {
              title: "OSINT & Profiling",
              desc: "Use open-source intelligence tools to deeply research your targets before launching simulations."
            },
            {
              title: "Threat Intelligence",
              desc: "Check if employee emails have been exposed in global data breaches in the past."
            },
            {
              title: "API Integration",
              desc: "Connect this platform with external phishing tools or your enterprise systems via a secure REST API."
            }
          ]
        },
        steps: {
          title: "Just 4 Steps",
          desc: "From zero to a running campaign in less than 5 minutes.",
          step: "STEP",
          items: [
            {
              title: "Create Campaign",
              desc: "Define name, theme, and difficulty level. Select target departments."
            },
            {
              title: "Generate or Upload",
              desc: "Let AI create the template, or upload your own custom HTML."
            },
            {
              title: "Launch!",
              desc: "One click phishing emails are sent to all targets automatically."
            },
            {
              title: "Monitor & Analyze",
              desc: "View the real-time dashboard: who fell for it, who remained alert."
            }
          ]
        },
        cta: {
          title: "Ready to Upgrade Your Security?",
          desc: "Start your first phishing simulation today. Free, no credit card required, no trial time limit.",
          btn_signup: "🚀 Sign Up Free",
          btn_login: "Admin Login"
        },
        about: {
          title: "Building a Human Firewall",
          desc: "PhiSim was born from a simple idea: technology alone cannot stop phishing. We believe that training the human mind is the ultimate defense against social engineering.",
          quote: "\"A firewall can block malware, but only awareness can stop deception.\"",
          mission: "Our mission is to democratize enterprise-grade security awareness training, making it accessible, engaging, and highly effective for teams of all sizes."
        },
        faq: {
          title: "Frequently Asked Questions",
          desc: "Everything you need to know about PhiSim.",
          items: [
            {
              q: "Is it really free?",
              a: "Yes! PhiSim is an open-source project designed to provide free access to essential phishing simulation tools."
            },
            {
              q: "How does the AI generator work?",
              a: "We integrate with powerful LLMs. By providing a theme, the AI generates context-aware, highly realistic phishing emails complete with psychological triggers."
            },
            {
              q: "Can I use my own HTML templates?",
              a: "Absolutely. You can upload custom raw HTML files for the landing page, and our engine will automatically parse and intercept form submissions."
            },
            {
              q: "Are the simulated emails actually sent?",
              a: "Yes, the emails are sent via SMTP to the target employees. Ensure you have authorized the simulation within your organization before launching."
            }
          ]
        },
        footer_links: {
          product: {
            title: "Product",
            features: "Features",
            pricing: "Pricing",
            changelog: "Changelog"
          },
          resources: {
            title: "Resources",
            documentation: "Documentation",
            blog: "Security Blog",
            templates: "Template Gallery"
          },
          legal: {
            title: "Legal",
            privacy: "Privacy Policy",
            terms: "Terms of Service"
          }
        },
        footer_copyright: "© 2026 PHISIM // CRAFTED WITH ❤️ FOR BETTER CYBERSECURITY"
      },
      dashboard_layout: {
        mobile_menu: "Menu",
        logout: "Logout",
        light_mode: "Light Mode",
        dark_mode: "Dark Mode",
        menus: {
          dashboard: "Dashboard",
          campaigns: "Campaigns",
          templates: "Email Gallery",
          landing_pages: "Landing Page Gallery",
          osint: "OSINT & SocEng",
          intel: "Threat Intel",
          employees: "Employees",
          departments: "Departments",
          reports: "Reports",
          api_keys: "API Keys",
          profile: "My Profile"
        }
      },
      admin_dashboard: {
        loading: "Loading...",
        greeting: {
          morning: "Good Morning",
          afternoon: "Good Afternoon",
          evening: "Good Evening",
          subtitle: "Here is the security summary of your organization today."
        },
        health: {
          title: "Organization Status: ",
          status_healthy: "Healthy",
          msg_healthy: "Your employees have good security awareness. Keep it up!",
          status_critical: "Critical",
          msg_critical: "Click rate is very high! Execute educational simulations immediately.",
          status_warning: "Warning",
          msg_warning: "Some employees are vulnerable to attacks. Extra attention needed."
        },
        tips: {
          title: "Security Tip of the Day",
          desc: "Phishing often happens on holidays or weekends when employees are off guard. Schedule simulation campaigns randomly to train their awareness in all situations. Use topics relevant to daily work like 'Leave Policy Update' or 'Office Email Password Reset'."
        },
        quick_actions: {
          new_campaign: "New Campaign",
          add_employee: "Add Employee",
          intel_scan: "Intel Scan",
          view_report: "View Report"
        },
        stats: {
          total_campaigns: "Total Campaigns",
          targets_reached: "Targets Reached",
          overall_click_rate: "Overall Click Rate",
          high_risk: "High Risk Employees"
        },
        charts: {
          employee_risk: "Employee Risk Level",
          risk_low: "Low",
          risk_medium: "Medium",
          risk_high: "High",
          campaign_events: "Campaign Event Distribution",
          no_data: "No data available."
        },
        recent_activity: {
          title: "Recent Activity",
          view_all: "View All",
          empty: "No recent activities.",
          event: "Event",
          time: "Time"
        },
        buttons: {
          all_campaigns: "All Campaigns"
        },
        nav_cards: {
          campaigns: { title: "Campaigns", desc: "Create & manage simulations" },
          employees: { title: "Employees", desc: "Manage target data" },
          departments: { title: "Departments", desc: "Organize structure" },
          reports: { title: "Reports", desc: "Analyze campaign results" }
        },
        landing_pages: {
          title: "Landing Page Gallery",
          subtitle: "Manage phishing landing page templates (custom HTML & default).",
          btn_add: "Add Template",
          empty_title: "No Templates Yet",
          empty_desc: "Click the add template button to create a new landing page.",
          table_name: "Name",
          table_type: "Type",
          table_desc: "Description",
          table_date: "Date Created",
          table_actions: "Actions",
          modal_add_title: "Add Landing Page Template",
          form_name: "Template Name",
          form_name_placeholder: "e.g., Login Portal 2",
          form_desc: "Description",
          form_desc_placeholder: "Brief description",
          form_html: "Raw HTML Code",
          btn_cancel: "Cancel",
          btn_save: "Save Template",
          preview_unavailable: "Preview is not available for custom builder.",
          action_preview: "Preview",
          action_delete: "Delete",
          messages: {
            load_failed: "Failed to load landing page templates",
            delete_default_error: "Default templates cannot be deleted",
            delete_confirm: "Delete template {{name}}?",
            delete_success: "Template successfully deleted",
            delete_failed: "Failed to delete template",
            save_success: "Template successfully saved",
            save_failed: "Failed to save template",
            load_detail_failed: "Failed to load template details"
          }
        },
        templates: {
          title: "Template Gallery",
          desc: "Collection of ready-to-use phishing templates. You can reuse them when creating new campaigns.",
          load_failed: "Failed to load template gallery",
          delete_confirm: 'Permanently delete template "{{name}}"?',
          delete_success: "Template deleted successfully",
          delete_failed: "Failed to delete template",
          modal_preview: "Preview Template",
          modal_subject: "Subject:",
          modal_sender: "Sender:",
          empty_title: "No Templates Saved",
          empty_desc: "To save a template, open a completed campaign report and click 'Save to Gallery'.",
          table_name: "Template Name",
          table_subject: "Email Subject",
          table_sender: "Sender",
          table_date: "Date Saved",
          table_actions: "Actions",
          action_preview: "Preview Template",
          action_delete: "Delete Template"
        },
        employees: {
          title: "Employee Management",
          desc: "Manage the list of employees who will be the targets of the phishing simulations.",
          step1_title: "Personal Data",
          step2_title: "Organization Data",
          btn_add: "Add Employee",
          form_edit: "Edit Employee",
          form_new: "New Employee",
          step1_header: "👤 Step 1: Personal Data",
          step1_desc: "Enter the employee's full name and active email address.",
          full_name: "Full Name",
          name_placeholder: "Enter full name",
          email_addr: "Email Address",
          step2_header: "🏢 Step 2: Organization Data",
          step2_desc: "Assign the employee to a department so you can filter reports by department.",
          department: "Department",
          select_dept: "Select department",
          position: "Position",
          pos_placeholder: "e.g. IT Staff",
          is_active: "Active Account",
          btn_save: "Save Changes",
          btn_add_submit: "Add Employee",
          search_placeholder: "Search employees...",
          col_name: "Name",
          col_email: "Email",
          col_status: "Status",
          col_actions: "Actions",
          empty_table: "No employees found",
          status_active: "ACTIVE",
          status_inactive: "INACTIVE",
          messages: {
            load_failed: "Failed to load data",
            update_success: "Employee updated successfully",
            add_success: "Employee added successfully",
            save_failed: "Failed to save employee",
            delete_confirm: 'Delete employee "{{name}}"? Related target data might be lost.',
            delete_success: "Employee deleted",
            delete_failed: "Failed to delete employee"
          }
        },
        departments: {
          title: "Department Structure",
          desc: "Organize employees by division or department for easier campaign targeting.",
          step1_title: "Department Name",
          step2_title: "Details & Description",
          btn_add: "Add Department",
          form_edit: "Edit Department",
          form_new: "New Department",
          step1_header: "🏢 Step 1: Department Name",
          step1_desc: "Enter the department name (e.g., Finance, HR, IT).",
          dept_name: "Department Name",
          name_placeholder: "e.g., Marketing, IT, Finance",
          step2_header: "📝 Step 2: Description (Optional)",
          step2_desc: "Add a brief description of this department if needed.",
          desc_label: "Description (Optional)",
          desc_placeholder: "Describe the function and responsibilities of this department",
          btn_save: "Save Changes",
          btn_add_submit: "Add Department",
          no_desc: "No description",
          employee_count: "employees",
          messages: {
            load_failed: "Failed to load departments",
            update_success: "Department updated successfully",
            add_success: "Department added successfully",
            save_failed: "Failed to save department",
            delete_confirm: 'Delete department "{{name}}"?',
            delete_success: "Department deleted",
            delete_failed: "Failed to delete"
          }
        },
        profile: {
          title: "Profile Management",
          desc: "Configure your system identity and access credentials",
          personal_info: "Personal Information",
          full_name: "Full Name",
          name_placeholder: "Enter full name",
          email_addr: "Email Address",
          email_placeholder: "Enter email address",
          security_credentials: "Security Credentials",
          new_password: "New Password",
          new_password_placeholder: "Leave empty to keep current password",
          confirm_password: "Confirm Password",
          confirm_password_placeholder: "Repeat new password",
          btn_saving: "SAVING...",
          btn_save: "SAVE CHANGES",
          messages: {
            password_mismatch: "New password and confirmation do not match",
            update_success: "Profile updated successfully",
            update_failed: "Failed to update profile"
          }
        },
        auth: {
          google_success: "Google Login successful!",
          google_failed: "Google Login failed",
          google_error: "Failed to connect to Google",
          missing_fields: "Username and password are required",
          login_success: "Login successful!",
          login_failed: "Login failed",
          back_home: "Back to Home",
          app_name: "PhiSim",
          app_desc: "Security Awareness Platform",
          username_label: "Username",
          username_placeholder: "Enter username",
          password_label: "Password",
          password_placeholder: "Enter password",
          btn_login: ">> ACCESS SYSTEM",
          or: "OR",
          btn_google: "CONTINUE WITH GOOGLE",
          no_account: "Don't have an account? ",
          register_now: "Register now",
          google_reg_success: "Google Register/Login successful!",
          missing_reg_fields: "Username, Email, and Password are required",
          reg_success: "Registration successful! Please login.",
          reg_failed: "Registration failed",
          reg_title: "Create Account",
          reg_desc: "Register as a New Admin",
          username_req: "Username *",
          username_unique: "Choose a unique username",
          email_req: "Email *",
          email_placeholder: "email@company.com",
          fullname_label: "Full Name",
          optional: "Optional",
          password_req: "Password *",
          password_min: "Min. 6 characters",
          btn_register: ">> REGISTER NOW",
          has_account: "Already have an account? ",
          login_here: "Login here"
        },
        apikeys: {
          title: "API Keys",
          desc: "Manage integrations with external phishing websites",
          btn_create: "Create API Key",
          banner_title: "External Web Phishing Integration",
          banner_desc: 'Create an API Key to connect third-party phishing sites to this platform. The external site simply sends data via <code style="background: rgba(0, 240, 255, 0.1); padding: 2px 6px; border-radius: 4px; color: var(--accent-primary); font-family: monospace">POST</code> to the provided URL. Received data will appear in the related Campaign Reports.',
          form_title: "Create New API Key",
          step1_title: "Basic Info",
          step2_title: "Target Campaign",
          step1_header: "🏷️ Name or Label",
          step1_desc: "Give your API Key a name to easily identify it",
          label_name: "Name / Label",
          name_placeholder: "e.g., Bank Login Clone",
          step2_header: "🎯 Target Campaign",
          step2_desc: "Select the campaign that will receive data from this API Key",
          label_campaign: "Campaign",
          select_campaign: "-- Select Campaign --",
          btn_submit: "Create API Key",
          empty_table: "No API Keys found",
          col_name: "Name",
          col_campaign: "Campaign",
          col_apikey: "API Key",
          col_status: "Status",
          col_last_used: "Last Used",
          col_actions: "Actions",
          copy_key: "Copy Key",
          status_active: "ACTIVE",
          status_inactive: "INACTIVE",
          never_used: "Never",
          btn_example: "Example",
          copy_url: "Copy Endpoint URL",
          btn_delete: "Delete",
          example_title: "Integration Example",
          endpoint_url: "Endpoint URL:",
          curl_label: "cURL:",
          copy_curl: "Copy cURL",
          js_label: "JavaScript (Fetch):",
          js_comment: "// Put this in your phishing web form handler",
          copy_js: "Copy JavaScript",
          php_label: "PHP:",
          messages: {
            load_failed: "Failed to load data",
            create_success: "API Key created successfully!",
            create_failed: "Failed to create API Key",
            toggle_success: "API Key status updated",
            toggle_failed: "Failed to update status",
            delete_confirm: 'Delete API Key "{{name}}"? This action cannot be undone.',
            delete_success: "API Key deleted successfully",
            delete_failed: "Failed to delete API Key",
            copied: "Copied to clipboard!"
          }
        },
        reports: {
          title: "Campaign Reports",
          desc: "Comprehensive analytics of your phishing simulations. See who clicked, who reported, and overall risk.",
          empty_title: "No campaign selected",
          empty_desc: "Please go to the <strong>Campaigns</strong> page and click the <strong>&rarr;</strong> button on the campaign you want to view.",
          stat_sent: "Sent",
          stat_opened: "Opened",
          stat_clicked: "Clicked",
          stat_submit: "Submitted",
          report_for: "Report:",
          report_desc: "View campaign performance and analyze target vulnerability levels.",
          status_label: "Status:",
          theme_label: "Theme:",
          btn_save_tpl: "💾 Save Template",
          btn_analyzing: "Analyzing...",
          btn_gen_ai: "Generate AI Analysis",
          card_total: "Total Targets",
          card_open: "Open Rate",
          card_click: "Click Rate",
          card_submit: "Submit Rate",
          funnel_title: "Interaction Funnel",
          ai_title: "AI Analysis",
          internal_title: "Target Details & Data (Internal)",
          col_name: "Name",
          col_email: "Email",
          col_dept: "Department",
          col_status: "Status",
          col_data: "Submitted Data",
          external_title: "External Web Submissions",
          col_time: "Time",
          col_apikey: "API Key",
          col_target_email: "Target Email (If Any)",
          col_ip: "IP Address",
          unknown_target: "Unknown",
          messages: {
            load_failed: "Failed to load report",
            ai_success: "AI Analysis generated successfully!",
            ai_failed: "Failed to generate analysis",
            tpl_not_found: "Template not found",
            tpl_prompt: "Enter a name to save this template:",
            tpl_saved: "Template saved to Gallery successfully",
            tpl_failed: "Failed to save template"
          }
        },
        osint: {
          page_title: "OSINT & Spear Phishing",
          page_desc: "Gather target digital footprints and simulate Social Engineering attacks.",
          btn_new_profile: "New Profile",
          form_title: "Create New OSINT Profile",
          form_desc: "Simulate how hackers gather Open-Source Intelligence (OSINT) to craft highly personalized Spear Phishing attacks.",
          step1_title: "🎯 Target Data",
          step1_desc: "Enter basic information about your target.",
          target_name: "Target Name",
          target_role: "Target Role",
          step2_title: "🕵️ Data OSINT",
          step2_desc: "Collect and input the target's digital footprints.",
          scrape_url: "Scraping URL (Optional)",
          scrape_hint: "Use this to extract text from news articles, blogs, or public profiles.",
          digital_footprint: "Digital Footprint Data (Manual / Scraped)",
          btn_run_ai: ">> RUN AI PROFILER",
          history_title: "Profiling History",
          history_empty: "No OSINT profiling history yet.",
          detail_empty: "Select a profile on the left to view the analysis details.",
          btn_close: "Close",
          role_label: "Role:",
          risk_label: "RISK:",
          attack_vectors: "Attack Vectors",
          phishing_draft: "Spear Phishing Draft (AI Generated)",
          raw_data: "Raw Data (OSINT Input)",
          messages: {
            load_failed: "Failed to load OSINT profiles",
            url_required: "Please enter a URL first",
            scraping: "Scraping URL...",
            scrape_success: "Successfully extracted text from URL",
            scrape_failed: "Failed to scrape URL",
            form_required: "Name and OSINT data are required!",
            analyzing: "AI is analyzing digital footprints...",
            analyze_success: "OSINT Analysis Complete & Saved!",
            analyze_failed: "Failed to perform analysis",
            delete_confirm: "Are you sure you want to delete this OSINT profile?",
            delete_success: "Profile deleted",
            delete_failed: "Failed to delete profile"
          }
        },
        intel: {
          title: "Threat Intel & Dark Web",
          desc: "Monitor your organization's exposed credentials and active threats in the wild.",
          tab_audit: "PASSWORD AUDITOR",
          tab_gen: "SECURE GENERATOR",
          audit_desc: "Enter a password to analyze its strength. The system will check it locally against the <i>RockYou dictionary</i> and globally via the k-Anonymity API (highly secure, your password will not be transmitted in full).",
          audit_placeholder: "Enter password to audit...",
          btn_run_audit: ">> RUN AUDIT",
          gen_placeholder: "Click Generate to create a password...",
          len_label: "Password Length",
          opt_upper: "Use Uppercase (A-Z)",
          opt_numbers: "Use Numbers (0-9)",
          opt_symbols: "Use Symbols (!@#$)",
          btn_generate: "GENERATE PASSWORD",
          risk_level: "RISK LEVEL:",
          entropy_score: "Entropy Score:",
          rockyou_found: "Password FOUND in common dictionaries.",
          rockyou_clean: "Password is not in common dictionaries.",
          pwned_found: "Leaked {{count}} times on the internet!",
          pwned_clean: "No breach history found.",
          feedback_title: "Improvement Suggestions:",
          messages: {
            audit_critical: "Password is very vulnerable!",
            audit_low: "Password is very strong!",
            audit_failed: "Failed to perform password audit",
            gen_success: "New password generated successfully!",
            gen_failed: "Failed to generate password",
            copied: "Password copied to clipboard!"
          }
        },
        campaigns: {
          title: "Phishing Simulation Campaigns",
          desc: "Manage fake attack scenarios to train your employees' awareness. Create a new campaign or monitor ongoing results.",
          btn_new: "Create Campaign",
          form: {
            title_new: "New Campaign",
            title_edit: "Edit Campaign",
            step1_short: "Basic Info",
            step2_short: "Email Setup",
            step3_short: "Landing Page",
            step1_title: "📋 Step 1: Basic Information",
            step1_desc: "Provide a name for this simulation and select which employee groups to test.",
            name: "Campaign Name",
            name_placeholder: "e.g., Q4 2026 Simulation",
            theme: "Phishing Theme (AI Only)",
            theme_placeholder: "e.g., IT Support Password Reset",
            theme_desc: "AI will create emails and fake pages based on this theme.",
            difficulty: "Difficulty Level",
            diff_low: "Low",
            diff_medium: "Medium",
            diff_high: "High",
            departments: "Target Departments",
            dept_warning: "Target departments cannot be changed after creation.",
            step2_title: "✉️ Step 2: Email & Link Settings",
            step2_desc: "Define how the fake email will be sent and where the link will point.",
            link_target: "Phishing Link Target",
            link_internal: "Internal Landing Page",
            link_external: "External Link",
            ext_url: "External URL",
            ext_url_desc: "Targets will be redirected here after click is tracked.",
            quishing: "🔲 Use QR Code (Quishing)",
            quishing_desc: "System will dynamically generate a QR code in the email to test if employees scan it suspiciously.",
            email_method: "Email Generation Method",
            email_ai: "AI Generated",
            email_custom: "✏️ Custom Email",
            email_gallery: "📚 From Gallery",
            select_template: "Select Template from Gallery",
            subject: "Email Subject",
            sender: "Sender Name",
            email_body: "Email Body (HTML)",
            tracking_hint_strong: "Important:",
            tracking_hint_1: "Insert the tag",
            tracking_hint_2: "inside the HTML so the system can track target clicks.",
            ai_instructions: "Additional AI Instructions",
            ai_instructions_placeholder: "Provide specific details for the AI to generate a more accurate email, for example:\n\nSender Name: Adli\nContext: CEO of XYZ company at 10 Merdeka St.\nTone: Formal and urgent",
            ai_instructions_desc: "Optional — AI will use these details to generate a more realistic and personalized email.",
            step3_title: "🌐 Step 3: Landing Page Setup",
            step3_desc: "Determine what happens when a target clicks the phishing link.",
            lpb: {
              tab_ai: "AI Generate",
              tab_custom: "✏️ Custom Builder",
              tab_template: "📋 From Template",
              tab_raw: "💻 Raw HTML",
              ai_title: "AI Landing Page Generation",
              ai_desc: "The landing page configuration will be generated automatically by AI based on your campaign's Theme and Difficulty Level when you click 'Generate Template' on the main page.",
              ai_active: "AI Mode Active",
              tmpl_title: "Select Template",
              tmpl_empty: "No templates available.",
              raw_title: "Upload HTML File",
              raw_desc: "Upload a raw HTML file (e.g. game login page) that will be displayed to the target. The system will magically intercept form submissions to capture credentials without breaking the design!",
              raw_code: "HTML Source Code",
              raw_placeholder: "Paste your HTML here...",
              preview_title: "Live Preview",
              preview_empty: "No HTML uploaded yet.",
              select_template_title: "Select Template",
              select_template_desc: "Please select a template from the list above to see a preview.",
              preview_placeholder: "Preview will appear here",
              edit_id: "Identity & Copy",
              edit_colors: "Colors & Theme",
              edit_fields: "Form Fields",
              edit_footer: "Footer",
              add_field: "Add Field"
            },
            btn_cancel: "Cancel",
            btn_next: "Next",
            btn_back: "Back",
            btn_save: "Save Campaign"
          },
          table: {
            name: "Campaign Name",
            difficulty: "Diff",
            status: "Status",
            targets: "Targets",
            created: "Created",
            actions: "Actions",
            people: "people"
          },
          actions: {
            generate: "Generate Template",
            launch: "Launch",
            edit: "Edit",
            delete: "Delete",
            detail: "Details"
          },
          messages: {
            load_data_failed: "Failed to load data",
            update_success: "Campaign updated successfully!",
            create_success: "Campaign created successfully!",
            save_failed: "Failed to save campaign",
            loading_data: "Loading data...",
            load_detail_failed: "Failed to load campaign details",
            delete_confirm: 'Delete campaign "{{name}}"? All related data (targets, templates, logs) will be permanently deleted.',
            delete_success: "Campaign deleted successfully",
            delete_failed: "Failed to delete campaign",
            generating_template: "AI is generating template...",
            generate_success: "Template generated successfully!",
            generate_failed: "Failed to generate template",
            launch_confirm: "Are you sure you want to launch this campaign?",
            launch_success: "Campaign launched successfully!",
            launch_failed: "Failed to launch"
          }
        }
      },
      education_page: {
        title: "🎯 This is a Phishing Simulation",
        subtitle_1: "The email you just clicked was part of the company's internal ",
        subtitle_strong: "security awareness training program",
        subtitle_2: ". None of your data has been stored or misused.",
        card1_title: "What Happened?",
        card1_desc: "You received a simulated phishing email and clicked a link inside it. In the real world, this action could compromise your personal and company data.",
        card2_title: "Tips to Identify Phishing",
        tips: [
          "✅ Check the sender's email address — is the domain official?",
          "✅ Beware of language that creates urgency or pressure",
          "✅ Don't click suspicious links — hover to see the real URL",
          "✅ Never enter your password on a page you don't recognize",
          "✅ Report suspicious emails to the IT/Security team"
        ],
        footer: "If you have any questions, contact the company's Information Security team.",
        tracking_id: "Tracking ID: "
      }
    }
  },
  id: {
    translation: {
      landing: {
        nav: {
          login: "LOGIN",
          register: "DAFTAR",
        },
        hero: {
          badge: "PLATFORM SIMULASI PHISHING BERTENAGA AI",
          title1: "Uji Ketahanan Tim",
          title2: "Anda Terhadap ",
          words: ["Phishing", "Social Engineering", "Cyber Attack"],
          desc: "Buat simulasi phishing dengan AI, kirim ke seluruh departemen, dan lihat siapa yang klik semua dalam satu dashboard yang intuitif. Gratis untuk dicoba.",
          btn_start: "Mulai Sekarang",
          btn_how_it_works: "Lihat Cara Kerja ↓"
        },
        stats: {
          delivery: "Delivery Rate",
          templates: "Template Siap",
          setup: "Setup Kampanye",
          monitor: "Monitoring",
          seconds: " detik"
        },
        features: {
          title: "Kenapa Harus PhiSim?",
          desc: "Tiga fitur utama yang membuat simulasi phishing semudah memesan kopi.",
          items: [
            {
              title: "AI Email Generator",
              desc: "Cukup tentukan tema AI akan membuatkan email phishing realistis lengkap dengan landing page tiruannya. Zero effort."
            },
            {
              title: "Custom HTML Engine",
              desc: "Punya desain sendiri? Upload file HTML tiruan Anda dan sistem akan memproses formulir login secara otomatis."
            },
            {
              title: "Real-Time Analytics",
              desc: "Pantau siapa yang membuka email, mengklik tautan, atau memasukkan data sensitif langsung dari dashboard interaktif."
            },
            {
              title: "OSINT & Profiling",
              desc: "Gunakan alat bantu intelijen open-source untuk meneliti target Anda secara mendalam sebelum melancarkan simulasi."
            },
            {
              title: "Threat Intelligence",
              desc: "Periksa apakah email karyawan pernah bocor dalam insiden kebocoran data global (data breach) di masa lalu."
            },
            {
              title: "API Integration",
              desc: "Hubungkan platform ini dengan tool phishing eksternal atau sistem perusahaan Anda melalui REST API yang aman."
            }
          ]
        },
        steps: {
          title: "Cuma 4 Langkah",
          desc: "Dari nol sampai kampanye berjalan kurang dari 5 menit.",
          step: "STEP",
          items: [
            {
              title: "Buat Kampanye",
              desc: "Tentukan nama, tema, dan level kesulitan. Pilih departemen target."
            },
            {
              title: "Generate atau Upload",
              desc: "Biarkan AI membuat template, atau upload HTML kustom Anda sendiri."
            },
            {
              title: "Luncurkan!",
              desc: "Satu klik email phishing terkirim ke seluruh target secara otomatis."
            },
            {
              title: "Pantau & Analisis",
              desc: "Lihat dashboard real-time: siapa yang terjebak, siapa yang waspada."
            }
          ]
        },
        cta: {
          title: "Siap Upgrade Keamanan?",
          desc: "Mulai simulasi phishing pertama Anda hari ini. Gratis, tanpa kartu kredit, tanpa batas waktu trial.",
          btn_signup: "🚀 Daftar Gratis",
          btn_login: "Login Admin"
        },
        about: {
          title: "Membangun Firewall Manusia",
          desc: "PhiSim lahir dari satu ide sederhana: teknologi saja tidak cukup untuk menghentikan phishing. Kami percaya bahwa melatih pikiran manusia adalah pertahanan pamungkas melawan rekayasa sosial.",
          quote: "\"Firewall dapat memblokir malware, tetapi hanya kesadaran yang dapat menghentikan tipu daya.\"",
          mission: "Misi kami adalah mendemokratisasi pelatihan kesadaran keamanan kelas perusahaan, menjadikannya mudah diakses, menarik, dan sangat efektif untuk tim dari berbagai ukuran."
        },
        faq: {
          title: "Pertanyaan yang Sering Diajukan",
          desc: "Semua yang perlu Anda ketahui tentang PhiSim.",
          items: [
            {
              q: "Apakah ini benar-benar gratis?",
              a: "Ya! PhiSim adalah proyek open-source yang dirancang untuk memberikan akses gratis ke alat simulasi phishing esensial."
            },
            {
              q: "Bagaimana cara kerja AI generator?",
              a: "Kami berintegrasi dengan LLM yang kuat. Dengan memberikan sebuah tema, AI akan menghasilkan email phishing yang sangat realistis dan sadar konteks, lengkap dengan pemicu psikologis."
            },
            {
              q: "Bisakah saya menggunakan template HTML saya sendiri?",
              a: "Tentu saja. Anda dapat mengunggah file HTML mentah untuk landing page, dan mesin kami akan secara otomatis mem-parsing dan mencegat pengiriman formulir."
            },
            {
              q: "Apakah email simulasi benar-benar dikirim?",
              a: "Ya, email dikirim via SMTP ke karyawan target. Pastikan Anda memiliki izin resmi di organisasi Anda sebelum meluncurkan simulasi."
            }
          ]
        },
        footer_links: {
          product: {
            title: "Produk",
            features: "Fitur",
            pricing: "Harga",
            changelog: "Pembaruan"
          },
          resources: {
            title: "Sumber Daya",
            documentation: "Dokumentasi",
            blog: "Blog Keamanan",
            templates: "Galeri Template"
          },
          legal: {
            title: "Hukum",
            privacy: "Kebijakan Privasi",
            terms: "Syarat & Ketentuan"
          }
        },
        footer_copyright: "© 2026 PHISIM // DIBUAT DENGAN ❤️ UNTUK KEAMANAN SIBER YANG LEBIH BAIK"
      },
      dashboard_layout: {
        mobile_menu: "Menu",
        logout: "Keluar",
        light_mode: "Mode Terang",
        dark_mode: "Mode Gelap",
        menus: {
          dashboard: "Dasbor",
          campaigns: "Kampanye",
          templates: "Galeri Email",
          landing_pages: "Galeri Landing Page",
          osint: "OSINT & SocEng",
          intel: "Threat Intel",
          employees: "Karyawan",
          departments: "Departemen",
          reports: "Laporan",
          api_keys: "API Keys",
          profile: "Profil Saya"
        }
      },
      admin_dashboard: {
        loading: "Memuat...",
        greeting: {
          morning: "Selamat Pagi",
          afternoon: "Selamat Siang",
          evening: "Selamat Malam",
          subtitle: "Berikut adalah ringkasan keamanan organisasi Anda hari ini."
        },
        health: {
          title: "Status Organisasi: ",
          status_healthy: "Sehat",
          msg_healthy: "Karyawan Anda memiliki kesadaran keamanan yang baik. Pertahankan!",
          status_critical: "Kritis",
          msg_critical: "Tingkat klik sangat tinggi! Segera jalankan simulasi edukasi.",
          status_warning: "Waspada",
          msg_warning: "Beberapa karyawan rentan terhadap serangan. Perlu perhatian ekstra."
        },
        tips: {
          title: "Tips Keamanan Hari Ini",
          desc: "Phishing sering terjadi pada hari libur atau akhir pekan ketika karyawan lengah. Jadwalkan kampanye simulasi secara acak untuk melatih kewaspadaan mereka di segala situasi. Gunakan topik yang relevan dengan pekerjaan sehari-hari seperti \"Pembaruan Kebijakan Cuti\" atau \"Reset Password Email Kantor\"."
        },
        quick_actions: {
          new_campaign: "Kampanye Baru",
          add_employee: "Tambah Karyawan",
          intel_scan: "Scan Intel",
          view_report: "Lihat Laporan"
        },
        stats: {
          total_campaigns: "Total Kampanye",
          targets_reached: "Target Terjangkau",
          overall_click_rate: "Rata-rata Klik",
          high_risk: "Karyawan Risiko Tinggi"
        },
        charts: {
          employee_risk: "Tingkat Risiko Karyawan",
          risk_low: "Rendah",
          risk_medium: "Sedang",
          risk_high: "Tinggi",
          campaign_events: "Distribusi Event Kampanye",
          no_data: "Tidak ada data."
        },
        recent_activity: {
          title: "Aktivitas Terbaru",
          view_all: "Lihat Semua",
          empty: "Belum ada aktivitas terbaru.",
          event: "Event",
          time: "Waktu"
        },
        buttons: {
          all_campaigns: "Semua kampanye"
        },
        nav_cards: {
          campaigns: { title: "Kampanye", desc: "Buat & kelola simulasi phishing" },
          employees: { title: "Karyawan", desc: "Kelola data karyawan target" },
          departments: { title: "Departemen", desc: "Atur struktur departemen" },
          reports: { title: "Laporan", desc: "Analisis hasil kampanye" }
        },
        landing_pages: {
          title: "Galeri Landing Page",
          subtitle: "Kelola template landing page phishing (HTML kustom & default).",
          btn_add: "Tambah Template",
          empty_title: "Belum Ada Template",
          empty_desc: "Klik tombol tambah template untuk membuat landing page baru.",
          table_name: "Nama",
          table_type: "Tipe",
          table_desc: "Deskripsi",
          table_date: "Tanggal Dibuat",
          table_actions: "Aksi",
          modal_add_title: "Tambah Landing Page Template",
          form_name: "Nama Template",
          form_name_placeholder: "Contoh: Login Portal 2",
          form_desc: "Deskripsi",
          form_desc_placeholder: "Deskripsi singkat",
          form_html: "Raw HTML Code",
          btn_cancel: "Batal",
          btn_save: "Simpan Template",
          preview_unavailable: "Preview tidak tersedia untuk builder custom.",
          action_preview: "Preview",
          action_delete: "Hapus",
          messages: {
            load_failed: "Gagal memuat template landing page",
            delete_default_error: "Template default tidak bisa dihapus",
            delete_confirm: "Hapus template {{name}}?",
            delete_success: "Template berhasil dihapus",
            delete_failed: "Gagal menghapus template",
            save_success: "Template berhasil disimpan",
            save_failed: "Gagal menyimpan template",
            load_detail_failed: "Gagal memuat detail template"
          }
        },
        osint: {
          page_title: "OSINT & Spear Phishing",
          page_desc: "Kumpulkan jejak digital target dan simulasikan serangan *Social Engineering*",
          btn_new_profile: "Profil Baru",
          form_title: "Buat Profil OSINT Baru",
          form_desc: "Simulasikan bagaimana peretas mengumpulkan jejak digital (OSINT) untuk menyusun serangan Spear Phishing yang sangat terpersonalisasi.",
          step1_title: "🎯 Data Target",
          step1_desc: "Masukkan informasi dasar mengenai target Anda",
          target_name: "Nama Target",
          target_role: "Jabatan Target",
          step2_title: "🕵️ Data OSINT",
          step2_desc: "Kumpulkan dan masukkan jejak digital target",
          scrape_url: "URL Scraping (Opsional)",
          scrape_hint: "Gunakan untuk mengambil teks dari artikel berita, blog, atau profil publik.",
          digital_footprint: "Data Jejak Digital (Manual / Hasil Scrape)",
          btn_run_ai: ">> JALANKAN AI PROFILER",
          history_title: "Riwayat Profiling",
          history_empty: "Belum ada riwayat profil OSINT.",
          detail_empty: "Pilih profil di sebelah kiri untuk melihat detail analisis.",
          btn_close: "Tutup",
          role_label: "Jabatan:",
          risk_label: "RISIKO:",
          attack_vectors: "Vektor Serangan (Attack Vectors)",
          phishing_draft: "Draf Spear Phishing (AI Generated)",
          raw_data: "Data Mentah (OSINT Input)",
          messages: {
            load_failed: "Gagal memuat profil OSINT",
            url_required: "Masukkan URL terlebih dahulu",
            scraping: "Scraping URL...",
            scrape_success: "Berhasil mengekstrak teks dari URL",
            scrape_failed: "Gagal melakukan scraping",
            form_required: "Nama dan data OSINT wajib diisi!",
            analyzing: "AI sedang menganalisis jejak digital...",
            analyze_success: "Analisis OSINT Selesai & Disimpan!",
            analyze_failed: "Gagal melakukan analisis",
            delete_confirm: "Yakin ingin menghapus profil OSINT ini?",
            delete_success: "Profil dihapus",
            delete_failed: "Gagal menghapus profil"
          }
        },
        templates: {
          title: "Galeri Template",
          desc: "Koleksi template phishing siap pakai. Anda dapat menggunakannya kembali saat membuat kampanye baru.",
          load_failed: "Gagal memuat galeri template",
          delete_confirm: 'Hapus template "{{name}}" secara permanen?',
          delete_success: "Template berhasil dihapus",
          delete_failed: "Gagal menghapus template",
          modal_preview: "Preview Template",
          modal_subject: "Subjek:",
          modal_sender: "Pengirim:",
          empty_title: "Belum Ada Template Tersimpan",
          empty_desc: 'Untuk menyimpan template, buka laporan kampanye yang sudah selesai dan klik "Simpan ke Galeri".',
          table_name: "Nama Template",
          table_subject: "Subjek Email",
          table_sender: "Pengirim",
          table_date: "Tanggal Disimpan",
          table_actions: "Aksi",
          action_preview: "Preview Template",
          action_delete: "Hapus Template"
        },
        employees: {
          title: "Manajemen Karyawan",
          desc: "Kelola daftar karyawan yang akan menjadi target simulasi phishing.",
          step1_title: "Data Pribadi",
          step2_title: "Data Organisasi",
          btn_add: "Tambah Karyawan",
          form_edit: "Edit Karyawan",
          form_new: "Karyawan Baru",
          step1_header: "👤 Langkah 1: Data Pribadi",
          step1_desc: "Masukkan nama lengkap dan alamat email aktif karyawan.",
          full_name: "Nama Lengkap",
          name_placeholder: "Masukkan nama lengkap",
          email_addr: "Alamat Email",
          step2_header: "🏢 Langkah 2: Data Organisasi",
          step2_desc: "Tentukan di departemen mana karyawan ini bekerja agar Anda dapat memfilter laporan berdasarkan departemen.",
          department: "Departemen",
          select_dept: "Pilih departemen",
          position: "Jabatan",
          pos_placeholder: "Misal: Staff IT",
          is_active: "Akun Aktif",
          btn_save: "Simpan Perubahan",
          btn_add_submit: "Tambah Karyawan",
          search_placeholder: "Cari karyawan...",
          col_name: "Nama",
          col_email: "Email",
          col_status: "Status",
          col_actions: "Aksi",
          empty_table: "Tidak ada karyawan",
          status_active: "AKTIF",
          status_inactive: "NONAKTIF",
          messages: {
            load_failed: "Gagal memuat data",
            update_success: "Karyawan berhasil diperbarui",
            add_success: "Karyawan berhasil ditambahkan",
            save_failed: "Gagal menyimpan karyawan",
            delete_confirm: 'Hapus karyawan "{{name}}"? Data target yang terkait mungkin akan hilang.',
            delete_success: "Karyawan dihapus",
            delete_failed: "Gagal menghapus karyawan"
          }
        },
        departments: {
          title: "Struktur Departemen",
          desc: "Kelompokkan karyawan berdasarkan divisi atau departemen untuk mempermudah target kampanye.",
          step1_title: "Nama Departemen",
          step2_title: "Detail & Deskripsi",
          btn_add: "Tambah Departemen",
          form_edit: "Edit Departemen",
          form_new: "Departemen Baru",
          step1_header: "🏢 Langkah 1: Nama Departemen",
          step1_desc: "Masukkan nama departemen (contoh: Keuangan, HRD, IT).",
          dept_name: "Nama Departemen",
          name_placeholder: "Misal: Marketing, IT, Finance",
          step2_header: "📝 Langkah 2: Deskripsi (Opsional)",
          step2_desc: "Tambahkan deskripsi singkat tentang departemen ini jika diperlukan.",
          desc_label: "Deskripsi (Opsional)",
          desc_placeholder: "Jelaskan fungsi dan tanggung jawab departemen ini",
          btn_save: "Simpan Perubahan",
          btn_add_submit: "Tambah Departemen",
          no_desc: "Tidak ada deskripsi",
          employee_count: "karyawan",
          messages: {
            load_failed: "Gagal memuat departemen",
            update_success: "Departemen berhasil diperbarui",
            add_success: "Departemen berhasil ditambahkan",
            save_failed: "Gagal menyimpan departemen",
            delete_confirm: 'Hapus departemen "{{name}}"?',
            delete_success: "Departemen dihapus",
            delete_failed: "Gagal menghapus"
          }
        },
        profile: {
          title: "Manajemen Profil",
          desc: "Konfigurasi identitas dan kredensial akses sistem Anda",
          personal_info: "Informasi Pribadi",
          full_name: "Nama Lengkap",
          name_placeholder: "Masukkan nama lengkap",
          email_addr: "Alamat Email",
          email_placeholder: "Masukkan alamat email",
          security_credentials: "Kredensial Keamanan",
          new_password: "Password Baru",
          new_password_placeholder: "Kosongkan jika tidak ingin mengubah",
          confirm_password: "Konfirmasi Password",
          confirm_password_placeholder: "Ulangi password baru",
          btn_saving: "MENYIMPAN...",
          btn_save: "SIMPAN PERUBAHAN",
          messages: {
            password_mismatch: "Password baru dan konfirmasi tidak cocok",
            update_success: "Profil berhasil diperbarui",
            update_failed: "Gagal memperbarui profil"
          }
        },
        auth: {
          google_success: "Login Google berhasil!",
          google_failed: "Login Google gagal",
          google_error: "Gagal terhubung ke Google",
          missing_fields: "Username dan password wajib diisi",
          login_success: "Login berhasil!",
          login_failed: "Login gagal",
          back_home: "Kembali ke Beranda",
          app_name: "PhiSim",
          app_desc: "Security Awareness Platform",
          username_label: "Username",
          username_placeholder: "Masukkan username",
          password_label: "Password",
          password_placeholder: "Masukkan password",
          btn_login: ">> AKSES SISTEM",
          or: "ATAU",
          btn_google: "LANJUTKAN DENGAN GOOGLE",
          no_account: "Belum punya akun? ",
          register_now: "Daftar sekarang",
          google_reg_success: "Daftar/Login Google berhasil!",
          missing_reg_fields: "Username, Email, dan Password wajib diisi",
          reg_success: "Registrasi berhasil! Silakan login.",
          reg_failed: "Registrasi gagal",
          reg_title: "Buat Akun",
          reg_desc: "Daftar Sebagai Admin Baru",
          username_req: "Username *",
          username_unique: "Pilih username unik",
          email_req: "Email *",
          email_placeholder: "email@company.com",
          fullname_label: "Nama Lengkap",
          optional: "Opsional",
          password_req: "Password *",
          password_min: "Min. 6 karakter",
          btn_register: ">> DAFTAR SEKARANG",
          has_account: "Sudah punya akun? ",
          login_here: "Login di sini"
        },
        apikeys: {
          title: "API Keys",
          desc: "Kelola integrasi dengan web phishing eksternal",
          btn_create: "Buat API Key",
          banner_title: "Integrasi Web Phishing Eksternal",
          banner_desc: 'Buat API Key untuk menghubungkan web phishing milik pihak lain ke platform ini. Web phishing eksternal cukup mengirimkan data via <code style="background: rgba(0, 240, 255, 0.1); padding: 2px 6px; border-radius: 4px; color: var(--accent-primary); font-family: monospace">POST</code> ke URL yang disediakan. Data yang diterima akan muncul di halaman Laporan kampanye terkait.',
          form_title: "Buat API Key Baru",
          step1_title: "Informasi Dasar",
          step2_title: "Kampanye Terkait",
          step1_header: "🏷️ Nama atau Label",
          step1_desc: "Berikan nama untuk API Key Anda agar mudah diidentifikasi",
          label_name: "Nama / Label",
          name_placeholder: "Misal: Web BCA Clone, Landing Page Bank Mandiri",
          step2_header: "🎯 Kampanye Terkait",
          step2_desc: "Pilih kampanye yang akan menerima data dari API Key ini",
          label_campaign: "Kampanye",
          select_campaign: "-- Pilih Kampanye --",
          btn_submit: "Buat API Key",
          empty_table: "Belum ada API Key",
          col_name: "Nama",
          col_campaign: "Kampanye",
          col_apikey: "API Key",
          col_status: "Status",
          col_last_used: "Terakhir Digunakan",
          col_actions: "Aksi",
          copy_key: "Salin Key",
          status_active: "AKTIF",
          status_inactive: "NONAKTIF",
          never_used: "Belum pernah",
          btn_example: "Contoh",
          copy_url: "Salin URL Endpoint",
          btn_delete: "Hapus",
          example_title: "Contoh Integrasi",
          endpoint_url: "Endpoint URL:",
          curl_label: "cURL:",
          copy_curl: "Salin cURL",
          js_label: "JavaScript (Fetch):",
          js_comment: "// Pasang di handler form login web phishing Anda",
          copy_js: "Salin JavaScript",
          php_label: "PHP:",
          messages: {
            load_failed: "Gagal memuat data",
            create_success: "API Key berhasil dibuat!",
            create_failed: "Gagal membuat API Key",
            toggle_success: "Status API Key berhasil diubah",
            toggle_failed: "Gagal mengubah status",
            delete_confirm: 'Hapus API Key "{{name}}"? Tindakan ini tidak dapat dibatalkan.',
            delete_success: "API Key berhasil dihapus",
            delete_failed: "Gagal menghapus API Key",
            copied: "Disalin ke clipboard!"
          }
        },
        reports: {
          title: "Laporan Kampanye",
          desc: "Analitik komprehensif dari simulasi phishing Anda. Lihat siapa yang mengklik, siapa yang melapor, dan risiko keseluruhan.",
          empty_title: "Belum ada kampanye yang dipilih",
          empty_desc: "Silakan buka halaman <strong>Kampanye</strong> lalu klik tombol <strong>&rarr;</strong> pada kampanye yang ingin Anda lihat hasilnya.",
          stat_sent: "Terkirim",
          stat_opened: "Dibuka",
          stat_clicked: "Diklik",
          stat_submit: "Submit",
          report_for: "Laporan:",
          report_desc: "Lihat performa kampanye dan analisis tingkat kerentanan target.",
          status_label: "Status:",
          theme_label: "Tema:",
          btn_save_tpl: "💾 Simpan Template",
          btn_analyzing: "Menganalisis...",
          btn_gen_ai: "Generate Analisis AI",
          card_total: "Total Target",
          card_open: "Open Rate",
          card_click: "Click Rate",
          card_submit: "Submit Rate",
          funnel_title: "Funnel Interaksi",
          ai_title: "Analisis AI",
          internal_title: "Detail Target & Data (Internal)",
          col_name: "Nama",
          col_email: "Email",
          col_dept: "Departemen",
          col_status: "Status",
          col_data: "Data Disubmit",
          external_title: "Submisi Web Eksternal",
          col_time: "Waktu",
          col_apikey: "API Key",
          col_target_email: "Target Email (Jika Ada)",
          col_ip: "IP Address",
          unknown_target: "Tidak Dikenali",
          messages: {
            load_failed: "Gagal memuat laporan",
            ai_success: "Analisis AI berhasil digenerate!",
            ai_failed: "Gagal generate analisis",
            tpl_not_found: "Template tidak ditemukan",
            tpl_prompt: "Masukkan nama untuk menyimpan template ini:",
            tpl_saved: "Template berhasil disimpan ke Galeri",
            tpl_failed: "Gagal menyimpan template"
          }
        },
        intel: {
          title: "Threat Intel & Dark Web",
          desc: "Pantau kredensial organisasi Anda yang terekspos dan ancaman aktif di internet.",
          tab_audit: "PASSWORD AUDITOR",
          tab_gen: "SECURE GENERATOR",
          audit_desc: "Masukkan kata sandi untuk dianalisis kekuatannya. Sistem akan mengeceknya secara lokal terhadap <i>RockYou dictionary</i> dan secara global melalui API k-Anonymity (sangat aman, sandi Anda tidak akan terkirim secara utuh).",
          audit_placeholder: "Masukkan sandi yang ingin diaudit...",
          btn_run_audit: ">> JALANKAN AUDIT",
          gen_placeholder: "Klik tombol Generate untuk membuat sandi...",
          len_label: "Panjang Sandi",
          opt_upper: "Gunakan Huruf Besar (A-Z)",
          opt_numbers: "Gunakan Angka (0-9)",
          opt_symbols: "Gunakan Simbol (!@#$)",
          btn_generate: "GENERATE PASSWORD",
          risk_level: "RISK LEVEL:",
          entropy_score: "Entropy Score:",
          rockyou_found: "Sandi DITEMUKAN dalam daftar sandi pasaran.",
          rockyou_clean: "Sandi tidak ada di kamus pasaran.",
          pwned_found: "Bocor sebanyak {{count}} kali di internet!",
          pwned_clean: "Tidak ditemukan riwayat kebocoran.",
          feedback_title: "Saran Perbaikan:",
          messages: {
            audit_critical: "Sandi sangat rentan!",
            audit_low: "Sandi sangat kuat!",
            audit_failed: "Gagal melakukan audit sandi",
            gen_success: "Sandi baru berhasil dibuat!",
            gen_failed: "Gagal membuat sandi",
            copied: "Sandi disalin ke clipboard!"
          }
        },
        campaigns: {
          title: "Kampanye Simulasi Phishing",
          desc: "Kelola skenario serangan palsu untuk melatih kewaspadaan karyawan Anda. Buat kampanye baru atau pantau hasil yang sedang berjalan.",
          btn_new: "Buat Kampanye",
          form: {
            title_new: "Kampanye Baru",
            title_edit: "Edit Kampanye",
            step1_short: "Informasi Dasar",
            step2_short: "Pengaturan Email",
            step3_short: "Landing Page",
            step1_title: "📋 Langkah 1: Informasi Dasar",
            step1_desc: "Berikan nama untuk simulasi ini dan pilih grup karyawan mana yang ingin Anda uji.",
            name: "Nama Kampanye",
            name_placeholder: "Misal: Simulasi Q4 2026",
            theme: "Tema Phishing (Khusus AI)",
            theme_placeholder: "Misal: Reset Password IT Support",
            theme_desc: "AI akan membuat email dan halaman palsu berdasarkan tema ini.",
            difficulty: "Tingkat Kesulitan",
            diff_low: "Rendah",
            diff_medium: "Menengah",
            diff_high: "Tinggi",
            departments: "Target Departemen",
            dept_warning: "Target departemen tidak dapat diubah setelah kampanye dibuat.",
            step2_title: "✉️ Langkah 2: Pengaturan Email & Tautan",
            step2_desc: "Tentukan bagaimana email palsu akan dikirim dan ke mana tautannya akan mengarah.",
            link_target: "Tujuan Tautan Phishing",
            link_internal: "Internal Landing Page",
            link_external: "Link Eksternal",
            ext_url: "URL Eksternal",
            ext_url_desc: "Target akan diarahkan ke URL ini setelah klik dilacak.",
            quishing: "🔲 Gunakan QR Code (Quishing)",
            quishing_desc: "Sistem akan men-generate gambar QR Code secara dinamis ke dalam email untuk menguji apakah karyawan memindai kode tanpa curiga.",
            email_method: "Metode Pembuatan Email",
            email_ai: "AI Generated",
            email_custom: "✏️ Custom Email",
            email_gallery: "📚 Dari Galeri",
            select_template: "Pilih Template dari Galeri",
            subject: "Subjek Email",
            sender: "Nama Pengirim",
            email_body: "Isi Email (HTML)",
            tracking_hint_strong: "Penting:",
            tracking_hint_1: "Masukkan tag",
            tracking_hint_2: "di dalam HTML agar sistem dapat melacak klik target.",
            ai_instructions: "Instruksi Tambahan untuk AI",
            ai_instructions_placeholder: "Berikan detail spesifik agar AI membuat email yang lebih akurat, contoh:\n\nNama Pengirim: Adli\nKonteks: CEO perusahaan XYZ di alamat Jl. Merdeka No. 10\nGaya bahasa: Formal dan mendesak",
            ai_instructions_desc: "Opsional — AI akan menggunakan detail ini untuk membuat email yang lebih realistis dan personal.",
            step3_title: "🌐 Langkah 3: Desain Halaman Palsu (Landing Page)",
            step3_desc: "Ini adalah halaman yang akan dilihat karyawan jika mereka mengklik tautan di email.",
            lpb: {
              tab_ai: "AI Generate",
              tab_custom: "✏️ Custom Builder",
              tab_template: "📋 From Template",
              tab_raw: "💻 Raw HTML",
              ai_title: "AI Landing Page Generation",
              ai_desc: "Konfigurasi landing page akan di-generate secara otomatis oleh AI berdasarkan Tema dan Tingkat Kesulitan kampanye Anda saat tombol 'Generate Template' ditekan di halaman utama.",
              ai_active: "Mode AI aktif",
              tmpl_title: "Pilih Template",
              tmpl_empty: "Belum ada template tersedia.",
              raw_title: "Upload HTML File",
              raw_desc: "Unggah file HTML mentah (misal: halaman login game) yang akan ditampilkan kepada target. Sistem secara ajaib akan mencegat form submit agar data masuk ke tracker tanpa mengubah desain aslinya!",
              raw_code: "HTML Source Code",
              raw_placeholder: "Paste HTML Anda di sini...",
              preview_title: "Live Preview",
              preview_empty: "Belum ada HTML yang diupload",
              select_template_title: "Pilih Template",
              select_template_desc: "Silakan pilih template dari daftar di atas untuk melihat pratinjau.",
              preview_placeholder: "Pratinjau akan muncul di sini",
              edit_id: "Identity & Copy",
              edit_colors: "Colors & Theme",
              edit_fields: "Form Fields",
              edit_footer: "Footer",
              add_field: "Add Field"
            },
            btn_cancel: "Batal",
            btn_next: "Selanjutnya",
            btn_back: "Kembali",
            btn_save: "Simpan Kampanye"
          },
          table: {
            name: "Nama Kampanye",
            difficulty: "Diff",
            status: "Status",
            targets: "Target",
            created: "Dibuat",
            actions: "Aksi",
            people: "orang"
          },
          actions: {
            generate: "Generate Template",
            launch: "Luncurkan",
            edit: "Edit",
            delete: "Hapus",
            detail: "Detail"
          },
          messages: {
            load_data_failed: "Gagal memuat data",
            update_success: "Kampanye berhasil diperbarui!",
            create_success: "Kampanye berhasil dibuat!",
            save_failed: "Gagal menyimpan kampanye",
            loading_data: "Memuat data...",
            load_detail_failed: "Gagal memuat detail kampanye",
            delete_confirm: 'Hapus kampanye "{{name}}"? Semua data terkait (target, template, log) akan dihapus secara permanen.',
            delete_success: "Kampanye berhasil dihapus",
            delete_failed: "Gagal menghapus kampanye",
            generating_template: "AI sedang membuat template...",
            generate_success: "Template berhasil di-generate!",
            generate_failed: "Gagal generate template",
            launch_confirm: "Yakin ingin meluncurkan kampanye ini?",
            launch_success: "Kampanye berhasil diluncurkan!",
            launch_failed: "Gagal meluncurkan"
          }
        }
      },
      education_page: {
        title: "🎯 Ini Adalah Simulasi Phishing",
        subtitle_1: "Email yang baru saja Anda klik adalah bagian dari ",
        subtitle_strong: "program pelatihan kesadaran keamanan",
        subtitle_2: " internal perusahaan. Tidak ada data Anda yang disimpan atau disalahgunakan.",
        card1_title: "Apa yang Terjadi?",
        card1_desc: "Anda menerima email simulasi phishing dan mengeklik tautan di dalamnya. Di dunia nyata, tindakan ini bisa membahayakan data pribadi dan perusahaan Anda.",
        card2_title: "Tips Mengenali Phishing",
        tips: [
          "✅ Periksa alamat pengirim email — apakah domain-nya resmi?",
          "✅ Waspadai bahasa yang menimbulkan urgensi atau tekanan",
          "✅ Jangan klik tautan mencurigakan — arahkan kursor untuk melihat URL asli",
          "✅ Jangan pernah memasukkan password di halaman yang tidak Anda kenal",
          "✅ Laporkan email mencurigakan ke tim IT/Security"
        ],
        footer: "Jika Anda memiliki pertanyaan, hubungi tim Keamanan Informasi perusahaan.",
        tracking_id: "Tracking ID: "
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en', // Strict default to English for international competition
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
