from main import classify_path, should_edit


assert classify_path("textbooks/getting-started/chapters/welcome.chapter.ts") == "curriculum"
assert classify_path("tutor-data/events.jsonl") == "runtime"
assert classify_path("README.md") == "other"

assert should_edit("textbooks/getting-started/chapters/welcome.chapter.ts") is True
assert should_edit("tutor-data/events.jsonl") is False

print("ok")
