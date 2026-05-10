-- ============================================================
-- Trinity Lutheran College – MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS trinity_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trinity_college;

-- ─────────────────────────────────────────────
-- USERS (admin / staff login)
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('super_admin','admin','editor') NOT NULL DEFAULT 'editor',
  avatar_url    VARCHAR(500),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- SITE CONTENT (editable text blocks per section)
-- ─────────────────────────────────────────────
CREATE TABLE site_content (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section     VARCHAR(80) NOT NULL,   -- e.g. 'hero', 'about_mission', 'about_vision'
  `key`       VARCHAR(120) NOT NULL,  -- e.g. 'title', 'body', 'subtitle'
  value       LONGTEXT,
  updated_by  INT UNSIGNED,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_section_key (section, `key`),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- PROGRAM CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE program_categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- PROGRAMS
-- ─────────────────────────────────────────────
CREATE TABLE programs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id     INT UNSIGNED,
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) NOT NULL UNIQUE,
  degree_type     ENUM('certificate','diploma','bachelor','master','phd') NOT NULL,
  duration_years  DECIMAL(3,1),
  description     TEXT,
  objectives      TEXT,
  career_outcomes TEXT,
  admission_req   TEXT,
  thumbnail_url   VARCHAR(500),
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      SMALLINT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES program_categories(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- PROGRAM COURSE OUTLINE (file attachments per program)
-- ─────────────────────────────────────────────
CREATE TABLE program_documents (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id  INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_type   VARCHAR(20),  -- pdf, docx, etc.
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- MEDIA LIBRARY
-- ─────────────────────────────────────────────
CREATE TABLE media (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200),
  description  TEXT,
  type         ENUM('image','video','document') NOT NULL,
  url          VARCHAR(500) NOT NULL,         -- stored path or CDN URL
  thumbnail_url VARCHAR(500),                 -- for videos
  mime_type    VARCHAR(80),
  file_size_kb INT UNSIGNED,
  alt_text     VARCHAR(300),
  album_id     INT UNSIGNED,
  uploaded_by  INT UNSIGNED,
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- MEDIA ALBUMS / GALLERIES
-- ─────────────────────────────────────────────
CREATE TABLE media_albums (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  cover_id    INT UNSIGNED,                   -- FK to media
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE media ADD FOREIGN KEY (album_id) REFERENCES media_albums(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- STAFF / FACULTY
-- ─────────────────────────────────────────────
CREATE TABLE staff (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(150) NOT NULL,
  title        VARCHAR(120),       -- e.g. 'Dr.', 'Prof.'
  position     VARCHAR(150),       -- e.g. 'Academic Dean'
  department   VARCHAR(150),
  bio          TEXT,
  email        VARCHAR(180),
  phone        VARCHAR(30),
  photo_url    VARCHAR(500),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   SMALLINT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS / NEWS
-- ─────────────────────────────────────────────
CREATE TABLE announcements (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(300) NOT NULL,
  slug         VARCHAR(300) NOT NULL UNIQUE,
  excerpt      TEXT,
  body         LONGTEXT,
  cover_url    VARCHAR(500),
  category     ENUM('news','event','notice','scholarship') NOT NULL DEFAULT 'news',
  event_date   DATE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  author_id    INT UNSIGNED,
  published_at TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- ADMISSION REQUIREMENTS (editable list items)
-- ─────────────────────────────────────────────
CREATE TABLE admission_requirements (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_name  VARCHAR(120) NOT NULL DEFAULT 'general', -- 'general','documents','foreign'
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  sort_order  SMALLINT DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- STUDENT SERVICES
-- ─────────────────────────────────────────────
CREATE TABLE student_services (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(80),       -- icon name or SVG key
  image_url   VARCHAR(500),
  sort_order  SMALLINT DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- CONTACT MESSAGES (enquiry form submissions)
-- ─────────────────────────────────────────────
CREATE TABLE contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(180),
  phone      VARCHAR(30),
  subject    VARCHAR(300),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- SEED: default admin user 
-- ─────────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role) VALUES (
  'Super Admin',
  'admin@trinitylc.edu.et',
  '$2a$12$OVA1kDzqMBxiXMJdTPq85eflg4uYoDbDZVmxDsQK.cvrK44PxBxeS',
  'super_admin'
);

-- ─────────────────────────────────────────────
-- SEED: site content defaults
-- ─────────────────────────────────────────────
INSERT INTO site_content (section, `key`, value) VALUES
  ('hero',          'title',     'Advancing Academic Excellence'),
  ('hero',          'subtitle',  'Fostering a nurturing environment for students in Gambella, Ethiopia'),
  ('hero',          'cta_text',  'Explore Programs'),
  ('about',         'mission',   'At Trinity Lutheran College, our mission is to cultivate academic excellence, spark a lifelong curiosity for learning, critical thinking and nurture compassionate future leaders.'),
  ('about',         'vision',    'Our vision is to stand out as a leading institution known for advancing creativity, critical thinking, inspiring innovation, and preparing future leaders to become impactful global citizens.'),
  ('contact',       'phone1',    '0910004827'),
  ('contact',       'phone2',    '0901003098'),
  ('contact',       'email',     'manpign@gmail.com'),
  ('contact',       'address',   'Kebele 01, Salam Safer, Gambella, Ethiopia'),
  ('college_info',  'founded',   'September 16, 2017'),
  ('college_info',  'campus_ha', '3.2'),
  ('college_info',  'books',     '15,219');

-- ─────────────────────────────────────────────
-- SEED: program categories
-- ─────────────────────────────────────────────
INSERT INTO program_categories (name, slug, sort_order) VALUES
  ('Health Sciences',          'health-sciences',      1),
  ('Business & Management',    'business-management',  2),
  ('Social Sciences',          'social-sciences',      3);

-- ─────────────────────────────────────────────
-- SEED: programs
-- ─────────────────────────────────────────────
INSERT INTO programs (category_id, name, slug, degree_type, duration_years, is_published) VALUES
  (1, 'Clinical Nursing',         'clinical-nursing',         'diploma',   2.0, TRUE),
  (1, 'Nursing',                  'nursing',                  'bachelor',  4.0, TRUE),
  (1, 'Midwifery',                'midwifery',                'bachelor',  4.0, TRUE),
  (2, 'Accounting',               'accounting',               'bachelor',  4.0, TRUE),
  (2, 'Human Resource Management','human-resource-management','bachelor',  4.0, TRUE),
  (3, 'Social Work',              'social-work',              'bachelor',  4.0, TRUE);

-- ─────────────────────────────────────────────
-- SEED: admission requirements
-- ─────────────────────────────────────────────
INSERT INTO admission_requirements (group_name, title, description, sort_order) VALUES
  ('general',   'EHEEE Score',       'Achieve minimum passing scores on the Ethiopian Higher Education Entrance Examination as set by the Ministry of Education.',   1),
  ('general',   'Minimum cGPA',      'Applicants must possess a minimum cumulative GPA of 2.75 out of 4.00 or an officially recognized equivalent.',                2),
  ('foreign',   'Credential Eval',   'Foreign applicants must submit a credential equivalency evaluation issued by the Education and Training Authority (ETA).',     1),
  ('documents', 'Application Form',  'Completed official application form.',  1),
  ('documents', 'Transcripts',       'Official academic transcripts from previous institutions.',  2),
  ('documents', 'Certificates',      'Relevant academic certificates and supporting documents.',   3);

-- ─────────────────────────────────────────────
-- SEED: student services
-- ─────────────────────────────────────────────
INSERT INTO student_services (name, slug, description, icon, sort_order) VALUES
  ('Library Service',      'library',    'Access to 15,219+ imported books and journals — the largest library collection in the Gambella region.',  'BookOpen',   1),
  ('Laboratory Service',   'laboratory', 'State-of-the-art skills labs for nursing, midwifery, and health science hands-on training.',               'FlaskConical',2),
  ('Internship Programs',  'internship', 'Structured internship programs connecting students with professional environments in their field.',          'Briefcase',  3),
  ('Career Services',      'career',     'Guidance, resources, and networking opportunities to help students launch successful careers.',             'GraduationCap',4);
