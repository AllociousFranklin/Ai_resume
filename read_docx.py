from docx import Document

doc = Document('AI_Resume_Screening_SaaS_Complete_Blueprint.docx')
for p in doc.paragraphs:
    print(p.text)
