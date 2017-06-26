import csv, ast, json, sys

def main():
    if len(sys.argv) != 2:
        print("Usage: keywords_to_json.py input_filename")
        return

    result = []

    with open(sys.argv[1]) as f:
        reader = csv.DictReader(f)

        for row in reader:
            keyword_tuples = ast.literal_eval(row["keywords"])
            keywords = [keyword for keyword in keyword_tuples]
            # keywords = [keyword[0] for keyword in keyword_tuples]
            result.append(
                {
                    "category": row["category"],
                    "keywords": keywords
                }
            )

    with open("categories.json", "w+") as f:
        json.dump(result, f, sort_keys=True, indent=2)

if __name__ == "__main__":
    main()
