def classify_path(path):
    return "other"


def should_edit(path):
    return False


if __name__ == "__main__":
    print(classify_path("textbooks/getting-started/chapters/welcome.chapter.ts"))
