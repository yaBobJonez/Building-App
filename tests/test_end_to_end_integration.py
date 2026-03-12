import requests
from playwright.sync_api import sync_playwright, expect
import io

FRONTEND_URL = "http://localhost:80"
BACKEND_URL  = "http://localhost:8000"


def get_admin_id():
    users = requests.get(f"{BACKEND_URL}/users").json()
    return users[0]["user_id"]


def cleanup(tag):
    projects = requests.get(f"{BACKEND_URL}/projects").json()
    if not isinstance(projects, list):
        return
    for p in projects:
        if tag in p.get("name", ""):
            requests.delete(f"{BACKEND_URL}/projects/{p['project_id']}")


def create_project(name, address="вул. Тест, 1", budget=100.0):
    admin_id = get_admin_id()
    return requests.post(f"{BACKEND_URL}/projects", json={
        "name": name,
        "address": address,
        "initial_budget": budget,
        "created_by": admin_id,
    }).json()


def set_project_status(project_id, status):
    admin_id = get_admin_id()
    requests.put(f"{BACKEND_URL}/projects/{project_id}/status", json={
        "status": status,
        "changed_by": admin_id,
    })


def create_task(project_id, title, description="", deadline=None, status="TODO"):
    admin_id = get_admin_id()
    return requests.post(f"{BACKEND_URL}/tasks", json={
        "title": title,
        "description": description,
        "deadline": deadline,
        "status": status,
        "project_id": project_id,
        "created_by": admin_id,
    }).json()


def create_incident(project_id, title, priority="MEDIUM"):
    admin_id = get_admin_id()
    return requests.post(f"{BACKEND_URL}/incidents", json={
        "title": title,
        "priority": priority,
        "project_id": project_id,
        "created_by": admin_id,
    }).json()


def upload_document(project_id, title, file_name="plan_v1.pdf", status="DRAFT"):
    admin_id = get_admin_id()
    files = {'file': (file_name, io.BytesIO(b"pdf content"), "application/pdf")}
    params = {
        "title": title,
        "project_id": project_id,
        "created_by": admin_id,
        "status": status
    }
    return requests.post(f"{BACKEND_URL}/documents", params=params, files=files).json()


def test_TC01_create_project_success():
    cleanup("TC01")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_placeholder("Name").fill("ЖК Грін TC01")
        page.get_by_placeholder("Address").fill("вул. Миру, 1")
        page.get_by_placeholder("Budget").fill("500")
        page.get_by_role("button", name="Create").click()
        expect(page.get_by_text("ЖК Грін TC01").first).to_be_visible()
        browser.close()



def test_TC02_create_project_empty_address():
    cleanup("TC02")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="+ New Project").click()
        page.get_by_placeholder("Name").fill("Тест TC02")
        page.get_by_placeholder("Budget").fill("100")
        alert_message = []
        page.on("dialog", lambda dialog: (alert_message.append(dialog.message), dialog.accept()))
        page.get_by_role("button", name="Create").click()
        expect(page.get_by_text("Тест TC02")).not_to_be_visible()
        browser.close()



def test_TC04_approved_to_completed():
    cleanup("TC04")
    project_id = create_project("TC04 Test Project", "вул. Тест, 4", 100.0)
    set_project_status(project_id, "PENDING")
    set_project_status(project_id, "APPROVED")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC04 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        page.locator("select").first.select_option("COMPLETED")
        page.reload()
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC04 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        expect(page.locator("p").filter(has_text="COMPLETED")).to_be_visible()
        browser.close()



def test_TC05_create_task_success():
    cleanup("TC05")
    create_project("TC05 Project")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC05 Project").first.click()
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="+ Add New Task").click()
        page.locator("input").first.fill("TC05 Нова задача")
        page.locator("input[type='date']").fill("2026-12-31")
        page.locator("select").nth(1).select_option("TODO")
        page.locator("textarea").fill("Детальний опис для тест-кейсу TC05")
        page.get_by_role("button", name="Create Task").click()
        expect(page.get_by_text("TC05 Нова задача")).to_be_visible()
        browser.close()



def test_TC06_task_details():
    cleanup("TC06")
    project_id = create_project("TC06 Test Project")
    create_task(project_id, "TC06 Task", description="Опис задачі TC06", deadline="2026-12-31")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC06 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC06 Task").first.click()
        expect(page.locator("input[type='date']")).to_have_value("2026-12-31")
        expect(page.get_by_text("TC06 Task")).to_be_visible()
        expect(page.locator("select").nth(1)).to_have_value("TODO")
        expect(page.get_by_text("Опис задачі TC06")).to_be_visible()
        browser.close()



def test_TC07_task_status_changes():
    cleanup("TC07")
    project_id = create_project("TC07 Project")
    create_task(project_id, "TC07 Task", status="TODO")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC07 Project").first.click()
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("TODO")).to_be_visible()
        page.get_by_text("TC07 Task").first.click()
        page.locator("select").nth(1).select_option("IN_PROGRESS")
        page.get_by_role("button", name="Save Changes").click()
        expect(page.get_by_text("IN PROGRESS")).to_be_visible()
        task_row = page.locator("div").filter(has_text="TC07 Task").first
        task_row.locator(".custom-checkbox").click()
        expect(page.get_by_text("DONE")).to_be_visible()
        browser.close()


def test_TC08_upload_document():
    cleanup("TC08")
    create_project("TC08 Project")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC08 Project").first.click()
        page.wait_for_load_state("networkidle")
        with page.expect_file_chooser() as fc_info:
            page.get_by_role("button", name="Upload New Document").click()
        file_chooser = fc_info.value
        file_chooser.set_files({
            "name": "plan_v1.pdf",
            "mimeType": "application/pdf",
            "buffer": b"pdf content v1",
        })
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("plan_v1.pdf")).to_be_visible()
        browser.close()



def test_TC09_upload_new_document_version():
    cleanup("TC09")
    project_id = create_project("TC09 Project")
    upload_document(project_id, "Креслення TC09", file_name="plan_v1.pdf", status="STABLE")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")

        page.get_by_text("TC09 Project").first.click()
        page.wait_for_load_state("networkidle")
        doc_card = page.locator("div.border.border-gray-100.bg-white").filter(
            has=page.locator("h3", has_text="Креслення TC09")
        )
        expect(doc_card).to_be_visible()
        expect(doc_card.get_by_text("v1")).to_be_visible()
        with page.expect_file_chooser() as fc_info:
            doc_card.get_by_role("button", name="+ Add New Version").click()
        file_chooser = fc_info.value
        file_chooser.set_files({
            "name": "plan_v2.pdf",
            "mimeType": "application/pdf",
            "buffer": b"pdf content v2",
        })
        page.wait_for_load_state("networkidle")
        expect(doc_card.get_by_text("v2")).to_be_visible()
        expect(doc_card.get_by_text("v1")).to_be_visible()
        expect(doc_card.get_by_text("Versions: 2")).to_be_visible()
        browser.close()



def test_TC10_stable_status_uniqueness():
    cleanup("TC10")
    project_id = create_project("TC10 Project")
    upload_document(project_id, "Креслення TC10", file_name="plan_v1.pdf", status="STABLE")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC10 Project").first.click()
        page.wait_for_load_state("networkidle")
        doc_card = page.locator("div.border.border-gray-100.bg-white").filter(
            has=page.locator("h3", has_text="Креслення TC10")
        )
        with page.expect_file_chooser() as fc_info:
            doc_card.get_by_role("button", name="+ Add New Version").click()
        file_chooser = fc_info.value
        file_chooser.set_files({
            "name": "plan_v2.pdf",
            "mimeType": "application/pdf",
            "buffer": b"pdf content v2",
        })
        page.wait_for_load_state("networkidle")
        expect(doc_card.get_by_text("v2")).to_be_visible()
        expect(doc_card.get_by_text("v1")).to_be_visible()
        version_rows = doc_card.locator("select")
        expect(version_rows.nth(0)).to_have_value("DRAFT")
        expect(version_rows.nth(1)).to_have_value("STABLE")
        version_rows.nth(0).select_option("STABLE")
        page.wait_for_load_state("networkidle")
        expect(version_rows.nth(0)).to_have_value("STABLE")
        expect(version_rows.nth(1)).to_have_value("ARCHIVED")
        browser.close()



def test_TC11_create_critical_incident():
    cleanup("TC11")
    create_project("TC11 Test Project")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC11 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="+ Report").click()
        page.locator("input.input-field").nth(1).fill("TC11 Critical Incident")
        page.locator("select.input-field").nth(1).select_option("CRITICAL")
        page.get_by_role("button", name="Report Now").click()
        expect(page.get_by_text("TC11 Critical Incident")).to_be_visible()
        browser.close()



def test_TC12_search_incidents_by_title():
    cleanup("TC12")
    project_id = create_project("TC12 Project")
    create_incident(project_id, "TC12 Тріщина у фундаменті", priority="MEDIUM")
    create_incident(project_id, "TC12 Зламаний кран", priority="HIGH")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC12 Project").first.click()
        page.wait_for_load_state("networkidle")
        search_input = page.get_by_placeholder("Search...")
        search_input.fill("Тріщина")
        expect(page.get_by_text("TC12 Тріщина у фундаменті")).to_be_visible()
        expect(page.get_by_text("TC12 Зламаний кран")).not_to_be_visible()
        search_input.fill("")
        expect(page.get_by_text("TC12 Тріщина у фундаменті")).to_be_visible()
        expect(page.get_by_text("TC12 Зламаний кран")).to_be_visible()
        browser.close()
        


def test_TC13_filter_incidents_by_high_priority():
    cleanup("TC13")
    project_id = create_project("TC13 Test Project")
    create_incident(project_id, "TC13 High Incident", priority="HIGH")
    create_incident(project_id, "TC13 Low Incident", priority="LOW")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC13 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        page.locator("select.input-field").select_option("HIGH")
        page.wait_for_timeout(500)
        expect(page.get_by_text("TC13 High Incident")).to_be_visible()
        expect(page.get_by_text("TC13 Low Incident")).not_to_be_visible()
        browser.close()


def test_TC14_resolve_incident():
    cleanup("TC14")
    project_id = create_project("TC14 Test Project")
    create_incident(project_id, "TC14 Incident to Resolve", priority="HIGH")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(FRONTEND_URL)
        page.wait_for_load_state("networkidle")
        page.get_by_text("TC14 Test Project").first.click()
        page.wait_for_load_state("networkidle")
        incident_row = page.locator("div").filter(has_text="TC14 Incident to Resolve").first
        page.on("dialog", lambda dialog: dialog.accept())
        incident_row.hover()
        incident_row.get_by_role("button", name="Resolve").click()
        expect(page.get_by_text("TC14 Incident to Resolve")).not_to_be_visible()
        browser.close()