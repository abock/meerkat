PACKAGE = meerkat
VERSION = 0.2
DISPLAY_NAME = Meerkat
DISPLAY_DESCRIPTION = Optimizes the Firefox user interface to be more suitable to Netbook devices.
ID = {90203d6b-6997-4bf5-832d-e21edf2b9003}
MIN_FIREFOX_VERSION = 3.0.0.0
MAX_FIREFOX_VERSION = 3.5.*
MIN_GECKO_VERSION = 1.9.0
MAX_GECKO_VERSION = 1.9.*
BUILD_ID = `date +%Y%m%d%H%M%S`

XPI_FILE = $(PACKAGE)-$(VERSION).xpi

IN_FILES = \
	install.rdf \
	web-src/index.html

DIST_FILES = \
	content \
	skin \
	install.rdf \
	chrome.manifest \
	license.txt

CLEAN_FILES = \
	$(IN_FILES) \
	$(XPI_FILE) \
	$(PACKAGE)-$(VERSION).tar.bz2 \
	web

all: $(IN_FILES)

$(IN_FILES): %: %.in
	sed -e " \
		s/\@VERSION\@/$(VERSION)/g; \
		s/\@ID\@/$(ID)/g; \
		s/\@DISPLAY_NAME\@/$(DISPLAY_NAME)/g; \
		s/\@DISPLAY_DESCRIPTION\@/$(DISPLAY_DESCRIPTION)/g; \
		s/\@MAX_FIREFOX_VERSION\@/$(MAX_FIREFOX_VERSION)/g; \
		s/\@MIN_FIREFOX_VERSION\@/$(MIN_FIREFOX_VERSION)/g; \
		s/\@XPI_FILE\@/$(XPI_FILE)/g; \
	" < $< > $@

$(XPI_FILE): install.rdf
	rm -f $@
	zip -oqrX9 $@ $(DIST_FILES) -x "*/.svn/*" -x "*.in"

xpi: $(XPI_FILE)

web: clean xpi web-src/index.html web-src/*.png
	rm -rf web
	mkdir web
	sed -e "s/\@XPI_SHA1_HASH\@/`sha1sum $(XPI_FILE) | awk '{print$$1}'`/g" \
		< web-src/index.html > web/index.html
	cp $(XPI_FILE) web-src/*.png web
	ssh abock@getbanshee.org rm -rf public_html/meerkat
	scp -r web abock@getbanshee.org:public_html/meerkat

dist: clean
	rm -rf _dist; \
	mkdir -p _dist/$(PACKAGE)-$(VERSION); \
	find . -maxdepth 1 -not -name _dist -and -not -name . -and -not -name $(PACKAGE)* -exec cp -a {} _dist/$(PACKAGE)-$(VERSION) \;; \
	find _dist -type d -iregex '.*\.svn$$' | xargs rm -rf; \
	cd _dist; \
	tar cfj ../$(PACKAGE)-$(VERSION).tar.bz2 $(PACKAGE)-$(VERSION)
	rm -rf _dist

clean:
	rm -rf $(CLEAN_FILES)

install-dev:
	@ff_path=$$HOME/.mozilla/firefox; \
	profiles=(`grep Path= $${ff_path}/profiles.ini | cut -f2 -d=`); \
	echo "Which Firefox profile would you like to use for development?"; \
	echo; \
	i=0; \
	for ((i=0;i<$${#profiles[@]};i++)); do \
		echo "  $${i}) `echo $${profiles[$${i}]} | cut -f2 -d.`"; \
	done; \
	echo; \
	read -p "Profile Number: " profile_number; \
	echo; \
	profile=$${profiles[$${profile_number}]}; \
	profile_name=`echo $${profile} | cut -f2 -d.`; \
	[[ -z "$${profile}" ]] && { \
		echo "Invalid profile selection"; \
		echo; \
		exit 1; \
	}; \
	extensions_path="$${ff_path}/$${profile}/extensions"; \
	mkdir -p "$${extensions_path}"; \
	echo "`pwd`/" > "$${extensions_path}/${ID}"; \
	echo "Extension installed in development mode for '$${profile_name}' profile"; \
	echo "Launch firefox using 'firefox -P $${profile_name} -no-remote'"; \
	echo

