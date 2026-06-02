-- ============================================
-- PhiSimulation — PostgreSQL Triggers & Functions
-- Auto-update risk scores on event insert
-- ============================================

-- ============================================
-- FUNCTION: Update risk score when new log is inserted
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_risk_score()
RETURNS TRIGGER AS $$
DECLARE
    v_employee_id UUID;
    v_score_delta INTEGER;
BEGIN
    -- Get employee_id from the campaign target
    SELECT employee_id INTO v_employee_id
    FROM campaign_targets
    WHERE id = NEW.target_id;

    -- Skip if employee not found
    IF v_employee_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Determine score delta based on event type
    CASE NEW.event_type
        WHEN 'EMAIL_OPENED'    THEN v_score_delta := 5;
        WHEN 'LINK_CLICKED'    THEN v_score_delta := 20;
        WHEN 'DATA_SUBMITTED'  THEN v_score_delta := 50;
        ELSE v_score_delta := 0;
    END CASE;

    -- Upsert employee risk profile
    INSERT INTO employee_risk_profiles (
        id, employee_id, total_score, risk_level,
        times_opened, times_clicked, times_submitted
    )
    VALUES (
        gen_random_uuid(), v_employee_id, v_score_delta,
        CASE
            WHEN v_score_delta > 75 THEN 'HIGH'
            WHEN v_score_delta > 40 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        CASE WHEN NEW.event_type = 'EMAIL_OPENED' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'LINK_CLICKED' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'DATA_SUBMITTED' THEN 1 ELSE 0 END
    )
    ON CONFLICT (employee_id) DO UPDATE SET
        total_score = employee_risk_profiles.total_score + v_score_delta,
        risk_level = CASE
            WHEN (employee_risk_profiles.total_score + v_score_delta) > 75 THEN 'HIGH'
            WHEN (employee_risk_profiles.total_score + v_score_delta) > 40 THEN 'MEDIUM'
            ELSE 'LOW'
        END,
        times_opened = employee_risk_profiles.times_opened
            + CASE WHEN NEW.event_type = 'EMAIL_OPENED' THEN 1 ELSE 0 END,
        times_clicked = employee_risk_profiles.times_clicked
            + CASE WHEN NEW.event_type = 'LINK_CLICKED' THEN 1 ELSE 0 END,
        times_submitted = employee_risk_profiles.times_submitted
            + CASE WHEN NEW.event_type = 'DATA_SUBMITTED' THEN 1 ELSE 0 END,
        last_assessed_at = NOW(),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Fire after each log insert
-- ============================================
DROP TRIGGER IF EXISTS trg_update_risk_score ON campaign_logs;
CREATE TRIGGER trg_update_risk_score
AFTER INSERT ON campaign_logs
FOR EACH ROW
EXECUTE FUNCTION fn_update_risk_score();

-- ============================================
-- FUNCTION: Update campaign target status
-- Escalates status: PENDING -> SENT -> OPENED -> CLICKED -> SUBMITTED
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_target_status()
RETURNS TRIGGER AS $$
DECLARE
    v_new_status VARCHAR(30);
BEGIN
    -- Map event type to target status
    CASE NEW.event_type
        WHEN 'EMAIL_SENT'      THEN v_new_status := 'SENT';
        WHEN 'EMAIL_OPENED'    THEN v_new_status := 'OPENED';
        WHEN 'LINK_CLICKED'    THEN v_new_status := 'CLICKED';
        WHEN 'DATA_SUBMITTED'  THEN v_new_status := 'SUBMITTED';
        ELSE v_new_status := NULL;
    END CASE;

    -- Only escalate status (never downgrade)
    IF v_new_status IS NOT NULL THEN
        UPDATE campaign_targets
        SET status = v_new_status
        WHERE id = NEW.target_id
          AND CASE status
              WHEN 'PENDING'   THEN 0
              WHEN 'SENT'      THEN 1
              WHEN 'OPENED'    THEN 2
              WHEN 'CLICKED'   THEN 3
              WHEN 'SUBMITTED' THEN 4
              ELSE 0
          END < CASE v_new_status
              WHEN 'SENT'      THEN 1
              WHEN 'OPENED'    THEN 2
              WHEN 'CLICKED'   THEN 3
              WHEN 'SUBMITTED' THEN 4
              ELSE 0
          END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update target status on log insert
-- ============================================
DROP TRIGGER IF EXISTS trg_update_target_status ON campaign_logs;
CREATE TRIGGER trg_update_target_status
AFTER INSERT ON campaign_logs
FOR EACH ROW
EXECUTE FUNCTION fn_update_target_status();

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update timestamp to relevant tables
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_lp_templates_updated_at ON landing_page_templates;
CREATE TRIGGER trg_lp_templates_updated_at
BEFORE UPDATE ON landing_page_templates FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
