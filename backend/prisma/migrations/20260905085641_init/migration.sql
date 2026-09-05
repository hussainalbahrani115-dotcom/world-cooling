-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('question', 'diagnosis', 'paywall');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'paid', 'abandoned');

-- CreateTable
CREATE TABLE "appliances" (
    "id" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subsystems" (
    "id" TEXT NOT NULL,
    "appliance_id" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,

    CONSTRAINT "subsystems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL,
    "appliance_id" TEXT NOT NULL,
    "subsystem_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_nodes" (
    "id" TEXT NOT NULL,
    "appliance_id" TEXT NOT NULL,
    "subsystem_id" TEXT,
    "question_text" TEXT,
    "node_type" "NodeType" NOT NULL,
    "parent_node_id" TEXT,
    "confidence_weight" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "diagnostic_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_answers" (
    "id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "next_node_id" TEXT,

    CONSTRAINT "node_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "final_node_id" TEXT NOT NULL,
    "diagnosis_title" TEXT NOT NULL,
    "root_cause" TEXT NOT NULL,
    "severity_level" TEXT NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_parts" (
    "diagnosis_id" TEXT NOT NULL,
    "part_id" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "diagnosis_parts_pkey" PRIMARY KEY ("diagnosis_id","part_id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "store_url" TEXT NOT NULL,
    "stock_status" TEXT NOT NULL,
    "compatible_models" JSONB,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "appliance_id" TEXT NOT NULL,
    "current_node_id" TEXT,
    "answers_log" JSONB,
    "confidence_score" DOUBLE PRECISION,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_tokens" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL,
    "gateway_ref" TEXT,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_sku_key" ON "parts"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "subsystems" ADD CONSTRAINT "subsystems_appliance_id_fkey" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_appliance_id_fkey" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_subsystem_id_fkey" FOREIGN KEY ("subsystem_id") REFERENCES "subsystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_nodes" ADD CONSTRAINT "diagnostic_nodes_appliance_id_fkey" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_nodes" ADD CONSTRAINT "diagnostic_nodes_subsystem_id_fkey" FOREIGN KEY ("subsystem_id") REFERENCES "subsystems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_nodes" ADD CONSTRAINT "diagnostic_nodes_parent_node_id_fkey" FOREIGN KEY ("parent_node_id") REFERENCES "diagnostic_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_answers" ADD CONSTRAINT "node_answers_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "diagnostic_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_answers" ADD CONSTRAINT "node_answers_next_node_id_fkey" FOREIGN KEY ("next_node_id") REFERENCES "diagnostic_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_final_node_id_fkey" FOREIGN KEY ("final_node_id") REFERENCES "diagnostic_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_parts" ADD CONSTRAINT "diagnosis_parts_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_parts" ADD CONSTRAINT "diagnosis_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_appliance_id_fkey" FOREIGN KEY ("appliance_id") REFERENCES "appliances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_current_node_id_fkey" FOREIGN KEY ("current_node_id") REFERENCES "diagnostic_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
