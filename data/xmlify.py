from typing import *
import re
import xml.dom.minidom


def double_token(token_):
    return "<and>\n\t{}\n\t{}\n</and>".format(
        token(postags("sg"), token_), token(postags("pl"), token_)
    )


def token(attributes, token_):
    return '<token{}>{}</token>'.format(attributes, token_)


def postags(number):
    attributes = ' inflected="yes" postag=".*:{}:.*" postag_regexp="yes"'
    if number == "sg":
        return attributes.format("SIN")
    elif number == "pl":
        return attributes.format("PLU")
    else:
        raise Exception("Can only deal with singular or plural as input.")


def suggestion(s):
    return "<suggestion>{}</suggestion>".format(s)


def suggestions(suggestions_):
    return ", ".join([suggestion(s) for s in suggestions_])

def tokens(number, pattern):
    def token_(t):
        if number == "both":
            return double_token(t)
        elif number == "unknown":
            return token("", postag_attributes_exception("unknown") + t)
        else:
            return token(postags(number), postag_attributes_exception(number) + t)

    return "".join([token_(t) for t in pattern.split(" ")])


def antipattern(suggestion):
    tokens = re.findall(r"\w+|[.,:;*_·/]", suggestion)
    return "<antipattern>{}</antipattern>".format(
        "".join([token("", t) for t in tokens])
    )


def antipatterns(suggestions_):
    # words like "Mitarbeiter*innen" have to be split into separate tokens
    return "\n\t\t".join([antipattern(s) for s in suggestions_])


xml_template = """
<rule id="{id}" name="{pattern}">
    {antipatterns}
    <pattern>{replaced_tokens}</pattern>
    {suggestions}
    <message>Der Stern wird in den letzten Jahren zunehmend verwendet. Besonders häufig findet man das Sternchen im Kontexten, in denen aufgrund aktuelle Transgender- und Intersexualitätsdebatten nicht von lediglich zwei Geschlechtern ausgegangen wird, Geschlecht also nicht mehr als ein binäre System verstanden wird. Mit dem Sternchen soll bewusst irritiert und die Möglichkeit weitere Kategorien angedeutet werden.</message>
    <short>Die Bezeichnung "{pattern}" spricht nur männliche Leser an. Versuche alle Menschen anzusprechen.</short>
    <example correction="{corrections}"><marker>{pattern}</marker></example>
</rule>
"""


def rule_to_xml(pattern: str, number: str, suggestions_: List[str]) -> str:
    s = xml_template.format(
        id=id(pattern, number),
        pattern=pattern,
        antipatterns=antipatterns(suggestions_),
        replaced_tokens=tokens(number, pattern),
        number=number,
        suggestions=suggestions(suggestions_),
        corrections="|".join([startupper(s) for s in suggestions_]),
    )
    # parsed = xml.dom.minidom.parseString(s)
    # return parsed.toprettyxml()
    return s

def postag_attributes_exception(number):
    if number == "unknown":
        return '<exception postag=".*:(SIN|PLU):.*" postag_regexp="yes" />'
    elif number == "sg":
        return '<exception postag=".*:PLU:.*" postag_regexp="yes" />'
    elif number == "pl":
        return '<exception postag=".*:SIN:.*" postag_regexp="yes" />'
    else:
        return ""


def id(pattern, number):
    id_ = re.sub("\s", "_", pattern + "_" + number)
    return re.sub("[^A-ZÄÖÜa-zäöüß_]", "", id_)


def startupper(s: str) -> str:
    return s[0].capitalize() + s[1:]


def strip_spaces(a):
    s = re.sub("  +|\"|'", " ", a)
    a = re.sub("^ | $|[.,:;!?]", "", a)
    return a

# print(rule("Angreifer", "any", ["Angreifer*innen", "Angreifende"]))
