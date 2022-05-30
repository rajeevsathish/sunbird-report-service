CREATE TABLE IF NOT EXISTS report(reportid varchar(40) NOT NULL PRIMARY KEY, title text NOT NULL, description text NOT NULL, authorizedroles jsonb NOT NULL, status varchar(8) NOT NULL CHECK (status IN ('live', 'draft', 'retired')) DEFAULT 'draft', type varchar(8) NOT NULL CHECK (type in ('public', 'private')) DEFAULT 'private', reportaccessurl text NOT NULL UNIQUE, createdon timestamptz NOT NULL DEFAULT now(), updatedon timestamptz NOT NULL DEFAULT now(), createdby varchar(50) NOT NULL, reportconfig jsonb NOT NULL, templateurl text, slug varchar(10) NOT NULL, reportgenerateddate timestamptz NOT NULL DEFAULT now(), reportduration jsonb NOT NULL DEFAULT jsonb_build_object('startDate', now()::timestamptz, 'endDate', now()::timestamptz), tags jsonb NOT NULL, updatefrequency text NOT NULL);

CREATE TABLE IF NOT EXISTS report_summary(id varchar(40) NOT NULL PRIMARY KEY, reportid varchar(40) NOT NULL, chartid text, createdon timestamptz NOT NULL DEFAULT now(), createdby varchar(50) NOT NULL, summary text NOT NULL);

CREATE TABLE IF NOT EXISTS report_status(reportid varchar(40) NOT NULL REFERENCES report(reportid) ON DELETE CASCADE, hashed_val text NOT NULL, status varchar(8) NOT NULL CHECK (status IN ('live', 'draft', 'retired')) DEFAULT 'draft', PRIMARY KEY (reportid, hashed_val));

ALTER TABLE report ADD COLUMN IF NOT EXISTS parameters jsonb;

ALTER TABLE report_summary ADD COLUMN IF NOT EXISTS param_hash text;

ALTER TABLE report ADD COLUMN IF NOT EXISTS report_type varchar(8) NOT NULL DEFAULT 'report';

ALTER TABLE report ADD COLUMN IF NOT EXISTS visibilityflags jsonb;

ALTER TABLE report ADD COLUMN IF NOT EXISTS accesspath jsonb;

ALTER TABLE report DROP CONSTRAINT "report_type_check";

ALTER TABLE report ADD CONSTRAINT "report_type_check" CHECK (type in ('public', 'private', 'protected'));ƒ