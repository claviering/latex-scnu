filename=main

index: main

pdf:
	xelatex ${filename}.tex

# 编译生成参考文献
main:
	xelatex ${filename}
	bibtex ${filename}
	xelatex ${filename}
	xelatex ${filename}

clean:
	rm -v *.aux *.log *.toc *.ind *.gls *.glo *.idx *.ilg *.out *.bbl *.thm *.blg *.lot *.lof