def classify_path(path):
    if path.startswith("textbooks/") and path.endswith(".chapter.ts"):
        return "curriculum"
    if path.startswith("tutor-data/"):
        return "runtime"
    return "other"


def should_edit(path):
    return classify_path(path) == "curriculum"


if __name__ == "__main__":
    print(classify_path("textbooks/getting-started/chapters/welcome.chapter.ts"))
