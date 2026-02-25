const path = require("path");

const MIGRATION_ROOT = path.resolve(__dirname, "../../migration-data");

module.exports = {
  defaultBubbleBaseUrl: "https://123tutors.co.za",
  rawDir: path.join(MIGRATION_ROOT, "raw"),
  normalizedDir: path.join(MIGRATION_ROOT, "normalized"),
  defaultPageSize: 100,
  defaultDelayMs: 150,
  defaultRetries: 3,
  supportedTypes: [
    "bank_db",
    "bursary_names_db",
    "courses_db",
    "school_names_db",
    "tertiary_names_db",
    "tertiary_programmes_db",
    "tertiary_specializations_db",
    "user",
    "tutorrequestsdb",
  ],
  typeMappings: [
    {
      bubbleType: "bank_db",
      table: "bank",
      primaryKey: "unique_id",
      required: ["unique_id"],
      aliases: {},
    },
    {
      bubbleType: "bursary_names_db",
      table: "bursary_names",
      primaryKey: "unique_id",
      required: ["unique_id", "bursary_name"],
      aliases: {},
    },
    {
      bubbleType: "courses_db",
      table: "courses",
      primaryKey: "unique_id",
      required: ["unique_id"],
      aliases: {},
    },
    {
      bubbleType: "school_names_db",
      table: "school_names",
      primaryKey: "unique_id",
      required: ["unique_id", "school_names"],
      aliases: {},
    },
    {
      bubbleType: "tertiary_names_db",
      table: "tertiary_names",
      primaryKey: "unique_id",
      required: ["unique_id", "tertiary_name"],
      aliases: {
        tertiary_name_raw: "tertiary_name",
      },
    },
    {
      bubbleType: "tertiary_programmes_db",
      table: "tertiary_programmes",
      primaryKey: "unique_id",
      required: ["unique_id", "tertiary_programme"],
      aliases: {},
    },
    {
      bubbleType: "tertiary_specializations_db",
      table: "tertiary_specializations",
      primaryKey: "unique_id",
      required: ["unique_id", "tertiary_specialization"],
      aliases: {},
    },
    {
      bubbleType: "user",
      table: "user_profiles",
      primaryKey: "email",
      required: ["email", "unique_id"],
      aliases: {
        authentication_email_email: "email",
        authentication_google_email: "email",
        profile_picture: "profile_image_url",
      },
    },
    {
      bubbleType: "tutorrequestsdb",
      table: "tutor_requests",
      primaryKey: "unique_id",
      required: ["unique_id", "student_email", "student_first_name", "student_last_name"],
      aliases: {
        total_amount1: "total_amount",
      },
    },
  ],
  globalAliases: {
    _id: "unique_id",
    id: "unique_id",
    created_date: "creation_date",
    modified_date: "modified_date",
    created_by: "creator",
    usertype: "user_type",
    user_type_text: "user_type",
    tertiary_name: "tertiary_name",
    tertiary_name_text: "tertiary_name",
    tertiary_programme_text: "tertiary_programme",
    tertiary_specialization_text: "tertiary_specialization",
  },
};

