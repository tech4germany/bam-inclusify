morphy = list(open("dictionary.dump", encoding="utf-8").readlines())
length = len(morphy)
n = 19

for i in range(0, n):
    start = round(length / n * i)
    end = round(length / n * (i + 1))
    print(start, end)
    open(f"dumps/dictionary_{i}.dump", "w").write("".join(morphy[start:end]))
