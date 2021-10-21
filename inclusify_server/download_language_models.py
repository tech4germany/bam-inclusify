import stanza

print("Downloading language models ...")
nlp = stanza.download("de")
print("Loading language models ...")
nlp = stanza.Pipeline(lang="de", processors="tokenize,mwt,pos,lemma,depparse")
print("Language models loaded.")
