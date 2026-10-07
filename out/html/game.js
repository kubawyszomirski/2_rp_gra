(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  // Save compatibility (technical reference 19.3, Z — 0.40). Loading a save never runs scene
  // scripts, so the check runs here, right after every load: quick load, save slots, autosave or
  // file import. The scenes main and post_event repeat the check as a safety net.
  var guardLoadedSaves = function(dendryUI) {
    var proto = Object.getPrototypeOf(dendryUI.dendryEngine);
    if (proto.polishSaveGuard) {
      return;
    }
    var setState = proto.setState;
    proto.setState = function(state) {
      var result = setState.call(this, state);
      var rules = window.PolishRules;
      // A change of language moves the running game to the other language's scenes; it is not a loaded save.
      if (window.polishLanguageSwitch) {
        return result;
      }
      if (!rules || !rules.isSaveCompatible(this.state.qualities)) {
        var message = window.currentLanguage === 'pl' ?
            'Ten zapis pochodzi ze starszej wersji gry i nie da się go kontynuować. ' +
            'Starsze zapisy nie są przenoszone.\n\nRozpocząć teraz nową grę?' :
            'This save comes from an older version of the game and cannot be continued. ' +
            'Older saves are not converted.\n\nStart a new game now?';
        if (window.confirm(message)) {
          this.beginGame();
        } else {
          this.state.qualities.polish_save_incompatible = 1;
          this.goToScene('polish_incompatible_save');
        }
      }
      return result;
    };
    proto.polishSaveGuard = true;
  };

  // ---- Language (Polish version of 4 October 2026, decisions 3A and 4A). The English game is compiled into core.js;
  // `npm run build` also writes the Polish game to game_pl.json. The choice is a setting of this browser, not part of a
  // save, so one save continues in either language. English is the default.
  var LANGUAGE_KEY = 'pps_language';
  var gameTexts = {};
  // The scenes shown on the current page since its first scene, to redraw the page in another language.
  var pageScenes = null;
  window.currentLanguage = 'en';

  var storedLanguage = function() {
    try {
      return window.localStorage.getItem(LANGUAGE_KEY) === 'pl' ? 'pl' : 'en';
    } catch (e) {
      return 'en';
    }
  };
  var storeLanguage = function(lang) {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
    }
  };

  // ---- Numbers in the descriptions of choices (Z — 0.53): a setting of this browser, like the language; hidden by
  // default. The body class pl-hide-numbers hides the effect parentheses that window.displayText wraps (game.css).
  var NUMBERS_KEY = 'pps_effect_numbers';
  var storedShowNumbers = function() {
    try {
      return window.localStorage.getItem(NUMBERS_KEY) === 'show';
    } catch (e) {
      return false;
    }
  };
  var applyShowNumbers = function(show) {
    if (typeof document === 'undefined' || !document.body) {
      return;
    }
    document.body.classList.toggle('pl-hide-numbers', !show);
    var radio = document.getElementById(show ? 'numbers_show' : 'numbers_hide');
    if (radio) {
      radio.checked = true;
    }
  };
  window.setShowNumbers = function(show) {
    try {
      window.localStorage.setItem(NUMBERS_KEY, show ? 'show' : 'hide');
    } catch (e) {
    }
    applyShowNumbers(!!show);
  };

  // Texts of the page itself (index.html) and of the inherited interface code.
  var UI_TEXT = {
    game_title: {en: 'PPS: An Alternate History', pl: 'PPS: historia alternatywna'},
    page_title: {en: 'PPS: An Alternate History - Autumn Chen', pl: 'PPS: historia alternatywna - Autumn Chen'},
    library: {en: 'Library', pl: 'Biblioteka'},
    save_load: {en: 'Save/Load', pl: 'Zapis i odczyt'},
    options: {en: 'Options', pl: 'Opcje'},
    other_language: {en: 'Polski', pl: 'English'},
    tab_main: {en: 'Main', pl: 'Ogólne'},
    tab_politics: {en: 'Politics', pl: 'Polityka'},
    tab_economy: {en: 'Economy', pl: 'Gospodarka'},
    tab_defense: {en: 'Defense', pl: 'Obronność'},
    tab_polls: {en: 'Polls', pl: 'Sondaże'},
    music: {en: 'Music', pl: 'Muzyka'},
    currently_playing: {en: 'Currently playing: ', pl: 'Teraz gra: '},
    volume: {en: 'Volume:', pl: 'Głośność:'},
    pause: {en: 'Pause', pl: 'Pauza'},
    play: {en: 'Play', pl: 'Graj'},
    next_song: {en: 'Next song', pl: 'Następny utwór'},
    settings: {en: 'Settings', pl: 'Ustawienia'},
    language: {en: 'Language:', pl: 'Język:'},
    effect_numbers: {en: 'Numbers in choices:', pl: 'Liczby w opisach wyborów:'},
    backgrounds: {en: 'Backgrounds:', pl: 'Tła:'},
    event_images: {en: 'Event images:', pl: 'Obrazy wydarzeń:'},
    animations: {en: 'Animations:', pl: 'Animacje:'},
    music_setting: {en: 'Music:', pl: 'Muzyka:'},
    color_scheme: {en: 'Color scheme:', pl: 'Kolory:'},
    on: {en: 'On', pl: 'Wł.'},
    off: {en: 'Off', pl: 'Wył.'},
    light_mode: {en: 'Light mode', pl: 'Jasne'},
    dark_mode: {en: 'Dark mode', pl: 'Ciemne'},
    font_size: {en: 'Font size:', pl: 'Rozmiar czcionki:'},
    decrease_font: {en: 'Decrease font size', pl: 'Zmniejsz czcionkę'},
    increase_font: {en: 'Increase font size', pl: 'Zwiększ czcionkę'},
    close: {en: 'Close', pl: 'Zamknij'},
    mods: {en: 'Mods', pl: 'Mody'},
    import_save: {en: 'Import save file:', pl: 'Wczytaj plik zapisu:'},
    save: {en: 'Save', pl: 'Zapisz'},
    load: {en: 'Load', pl: 'Wczytaj'},
    delete: {en: 'Delete', pl: 'Usuń'},
    export: {en: 'Export', pl: 'Eksportuj'},
    empty: {en: 'Empty', pl: 'Pusty'},
    hand: {en: 'Hand - click a card to play.', pl: 'Ręka — kliknij kartę, aby ją zagrać.'},
    decks: {en: 'Decks - click a deck to draw a card.', pl: 'Talie — kliknij talię, aby dobrać kartę.'},
    tableau: {en: 'Decks and hand — click a deck to draw a card (two places for each deck), or a card to play it.',
      pl: 'Talie i ręka — kliknij talię, aby dobrać kartę (dwa miejsca na każdą talię), albo kartę, aby ją zagrać.'},
    discard: {en: 'Discard', pl: 'Odrzuć'},
    undiscardable: {en: 'cannot be discarded', pl: 'nie do odrzucenia'},
    free_place: {en: 'empty place', pl: 'wolne miejsce'},
    pinned: {en: 'Central Executive Committee - actions are only usable once per 6 months.', pl: 'Centralny Komitet Wykonawczy — każda akcja raz na 6 miesięcy.'},
    continue_choice: {en: 'Continue...', pl: 'Dalej…'},
    load_failed: {en: 'The Polish version could not be loaded; the game continues in English.',
      pl: 'Nie udało się wczytać polskiej wersji; gra toczy się dalej po angielsku.'},
    script_error: {en: 'A game script has failed, so elections and events may not appear. Reload the page without the cache (Cmd+Shift+R, or Ctrl+Shift+R).',
      pl: 'Skrypt gry zgłosił błąd, więc wybory i wydarzenia mogą się nie pojawić. Przeładuj stronę z pominięciem pamięci przeglądarki (Cmd+Shift+R albo Ctrl+Shift+R).'},
    script_error_close: {en: 'Close', pl: 'Zamknij'}
  };
  var uiText = function(key) {
    var entry = UI_TEXT[key];
    return entry ? (entry[window.currentLanguage] || entry.en) : key;
  };
  // Messages of the inherited interface code (core.js), shown with window.alert.
  var ALERT_TEXT = {
    'Saved.': 'Zapisano.',
    'Loaded.': 'Wczytano.',
    'No save available.': 'Brak zapisu.',
    'Saving and loading is currently disabled.': 'Zapisywanie i wczytywanie jest teraz wyłączone.'
  };
  var nativeAlert = window.alert;
  window.alert = function(message) {
    if (window.currentLanguage === 'pl' && Object.prototype.hasOwnProperty.call(ALERT_TEXT, message)) {
      message = ALERT_TEXT[message];
    }
    return nativeAlert.call(window, message);
  };

  // The save slots: core.js writes Save, Load and Empty when it fills them in.
  var translateSaveSlots = function() {
    if (typeof $ === 'undefined') {
      return;
    }
    var map = {Save: 'save', Load: 'load', Empty: 'empty', Zapisz: 'save', Wczytaj: 'load', Pusty: 'empty'};
    $('#saves_table .save_button, #saves_table .save_info').each(function() {
      var key = map[this.textContent];
      if (key) {
        this.textContent = uiText(key);
      }
    });
    $('#saves_table .delete_button').text(uiText('delete'));
    $('#saves_table .export_button').text(uiText('export'));
  };

  var applyLanguage = function(lang) {
    window.currentLanguage = lang === 'pl' ? 'pl' : 'en';
    if (window.PolishRules) {
      window.PolishRules.setLanguage(window.currentLanguage);
    }
    window.handDescription = uiText('hand');
    window.deckDescription = uiText('decks');
    window.pinnedCardsDescription = uiText('pinned');
    // Outside a page (the Node test of the save check) there is nothing more to translate.
    if (typeof document === 'undefined' || typeof $ === 'undefined') {
      return;
    }
    document.documentElement.lang = window.currentLanguage;
    document.title = uiText('page_title');
    $('[data-i18n]').each(function() {
      this.textContent = uiText(this.getAttribute('data-i18n'));
    });
    var paused = window.dendryUI && window.dendryUI.currentAudio && window.dendryUI.currentAudio.paused;
    $('#pause-button-text').text(uiText(paused ? 'play' : 'pause'));
    translateSaveSlots();
    $('#language_' + window.currentLanguage).prop('checked', true);
    $('#language-link').attr('lang', window.currentLanguage === 'pl' ? 'en' : 'pl');
  };

  // A compiled game from its JSON text, as the Dendry engine does it: scripts become functions.
  var reviveGame = function(text) {
    return JSON.parse(text, function(key, value) {
      if (value && typeof value === 'object' && value.$code !== undefined) {
        var source = String(value.$code).trim();
        /*jshint -W054 */
        var fn = new Function('state', 'Q', source);
        /*jshint +W054 */
        fn.source = source;
        return fn;
      }
      return value;
    });
  };
  var loadGameText = function(lang) {
    if (lang === 'en') {
      return Promise.resolve(window.game.compiled);
    }
    if (gameTexts[lang]) {
      return Promise.resolve(gameTexts[lang]);
    }
    return fetch('game_' + lang + '.json', {cache: 'no-cache'}).then(function(response) {
      if (!response.ok) {
        throw new Error('game_' + lang + '.json: ' + response.status);
      }
      return response.text();
    }).then(function(text) {
      gameTexts[lang] = text;
      return text;
    });
  };

  // Redraws the current page from the scenes of the new language, without running their scripts. Values that the
  // scripts of this page computed before the change keep their language until the next page (decision 3A).
  var redrawPage = function(engine, scenes) {
    var current = engine.state.sceneId;
    if (!scenes || !scenes.length || scenes[scenes.length - 1] !== current) {
      var scene = engine.game.scenes[current];
      scenes = scene && scene.newPage ? [current] : null;
    }
    if (!scenes) {
      return false;
    }
    var content = [];
    for (var i = 0; i < scenes.length; i++) {
      var s = engine.game.scenes[scenes[i]];
      if (s && s.content !== undefined) {
        content = content.concat(engine._makeDisplayContent(s.content, true));
      }
    }
    engine.state.currentContent = content;
    return true;
  };

  // Runs the game in the given compiled data: a new game, or the state of the running one in the other language.
  var startEngine = function(dendryUI, compiled, state, scenes) {
    var Engine = Object.getPrototypeOf(dendryUI.dendryEngine).constructor;
    dendryUI.game = compiled;
    dendryUI.dendryEngine = new Engine(dendryUI, compiled);
    ui = dendryUI;
    game = compiled;
    if (!state) {
      dendryUI.dendryEngine.beginGame();
      return;
    }
    window.polishLanguageSwitch = true;
    try {
      var engine = dendryUI.dendryEngine;
      engine.setState(state);
      // The displayed values of Status and the month page are recomputed in the new language by the same scripts that
      // compute them whenever the month page opens; they only rewrite display and mirror fields.
      var Q = engine.state.qualities;
      if (Q.S && Q.polish_portfolios && compiled.scenes.polish_opening_state) {
        engine._runActions(compiled.scenes.polish_opening_state.onArrival);
        if (engine.state.sceneId === 'main' && compiled.scenes.main.onArrival) {
          engine._runActions(compiled.scenes.main.onArrival);
        }
      }
      if (redrawPage(engine, scenes)) {
        engine.setState(engine.state);
      }
    } finally {
      window.polishLanguageSwitch = false;
    }
    pageScenes = scenes;
  };

  // Keeps the list of scenes on the current page (see redrawPage).
  var trackPages = function(proto) {
    if (proto.polishPageTracker) {
      return;
    }
    var displaySceneContent = proto.displaySceneContent;
    proto.displaySceneContent = function(restorePage) {
      var scene = this.getCurrentScene();
      if (restorePage) {
        pageScenes = null;
      } else if (scene && scene.newPage) {
        pageScenes = [this.state.sceneId];
      } else if (pageScenes) {
        pageScenes.push(this.state.sceneId);
      }
      return displaySceneContent.call(this, restorePage);
    };
    var setState = proto.setState;
    proto.setState = function(state) {
      pageScenes = null;
      return setState.call(this, state);
    };
    proto.polishPageTracker = true;
  };

  window.setLanguage = function(lang) {
    lang = lang === 'pl' ? 'pl' : 'en';
    if (lang === window.currentLanguage) {
      return;
    }
    var dendryUI = window.dendryUI;
    var state = JSON.parse(JSON.stringify(dendryUI.dendryEngine.getExportableState()));
    var scenes = pageScenes ? pageScenes.slice() : null;
    loadGameText(lang).then(function(text) {
      storeLanguage(lang);
      applyLanguage(lang);
      startEngine(dendryUI, reviveGame(text), state, scenes);
    }).catch(function(error) {
      console.error(error);
      window.alert(uiText('load_failed'));
      $('#language_' + window.currentLanguage).prop('checked', true);
    });
  };
  window.toggleLanguage = function() {
    window.setLanguage(window.currentLanguage === 'pl' ? 'en' : 'pl');
  };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // Add your custom code here.
    guardLoadedSaves(dendryUI);
    // Card draws, deck checks and card opening follow the Polish rules (implementation plan, stage 1).
    window.PolishEngineHooks.install(Object.getPrototypeOf(dendryUI.dendryEngine), window.PolishRules);
    trackPages(Object.getPrototypeOf(dendryUI.dendryEngine));
    // The engine adds an English 'Continue...' choice to a page without options; scripts compare that title, so it
    // is translated only on the screen.
    var displayChoices = dendryUI.displayChoices;
    if (typeof displayChoices === 'function') {
      dendryUI.displayChoices = function(choices) {
        if (window.currentLanguage !== 'en' && choices) {
          choices = choices.map(function(choice) {
            return choice && choice.title === 'Continue...' ? Object.assign({}, choice, {title: uiText('continue_choice')}) : choice;
          });
        }
        return displayChoices.call(this, choices);
      };
    }
    var populateSaveSlots = dendryUI.populateSaveSlots;
    if (typeof populateSaveSlots === 'function') {
      dendryUI.populateSaveSlots = function() {
        var result = populateSaveSlots.apply(this, arguments);
        translateSaveSlots();
        return result;
      };
    }
    var lang = storedLanguage();
    applyLanguage('en');
    if (lang === 'en') {
      return false;
    }
    // The chosen language begins the game when its data has loaded; on a failure the game begins in English.
    loadGameText(lang).then(function(text) {
      applyLanguage(lang);
      startEngine(dendryUI, reviveGame(text), null, null);
    }).catch(function(error) {
      console.error(error);
      storeLanguage('en');
      applyLanguage('en');
      dendryUI.dendryEngine.beginGame();
      window.alert(uiText('load_failed'));
    });
    return true;
  };

  var TITLE = "Social Democracy: An Alternate History" + '_' + "Autumn Chen";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO; 
  window.loadMod = function(url) {
      ui.loadGame(url);
  };

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };

  // TODO: update audio displays
  window.updateAudio = function(song) {
      var now_playing = document.getElementById('currently_playing');
      if (song) {
          var a = song.split('/');
          now_playing.textContent = a[a.length-1];
      } else {
          var s = window.dendryUI.currentAudioURL;
          var a = s.split('/');
          now_playing.textContent = a[a.length-1];
      }
  };

  // sets the volume
  window.setVolume = function(volume) {
      if (window.dendryUI.currentAudio) {
          window.dendryUI.volume = volume/100;
          window.dendryUI.currentAudio.volume = volume/100;
      }
  };

  // go to the next song - this just sets the time to 9999 lol.
  window.shuffle = function() {
      if (window.dendryUI.currentAudio) {
          window.dendryUI.currentAudio.currentTime = 9999;
      }
  };

  // toggles pause or play of music
  window.togglePausePlay = function() {
      if (window.dendryUI.currentAudio) {
          if (window.dendryUI.currentAudio.paused) {
            window.dendryUI.currentAudio.play();
            document.getElementById('pause-button-image').style.display = "inline";
            document.getElementById('play-button-image').style.display = "none";
            document.getElementById('pause-button');
            document.getElementById('pause-button-text').textContent = uiText('pause');
          } else {
            window.dendryUI.currentAudio.pause();
            document.getElementById('play-button-image').style.display = "inline";
            document.getElementById('pause-button-image').style.display = "none";
            document.getElementById('pause-button-text').textContent = uiText('play');
          }
      }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
    $('#language_' + window.currentLanguage).prop('checked', true);
    applyShowNumbers(storedShowNumbers());
  };

  
  // ---- Decks and hand (Z — 0.60, the user's notes of 7 X 2026) ----------------------------------------------------
  // The three decks in three rows, each with its two places of the hand (PolishEngineHooks.deckView). A closed deck is
  // greyed and says why. Under each card a button discards it, once a month; a timed card carries a badge with its last
  // month. The decks are drawn together with the hand, so window.displayDecks draws nothing.
  // Z — 0.63 (decision 4A): the badge is a stamp without the hourglass sign, and an empty place says so.
  var DECK_IDS = ['main.party', 'main.govt', 'main.parliament'];
  var MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var deadlineBadge = function(t) {
    var rules = window.PolishRules;
    var m = rules.monthOf(t), y = rules.yearOf(t);
    return window.currentLanguage === 'pl' ? 'do ' + MONTHS_ROMAN[m - 1] + ' ' + y : 'until ' + MONTHS_EN_SHORT[m - 1] + ' ' + y;
  };
  var deadlineText = function(t) {
    var rules = window.PolishRules;
    return window.currentLanguage === 'pl' ? 'Karta czasowa: zniknie z ręki po ' + rules.monthYear(t, 'loc') + '.' :
      'Timed card: it leaves the hand after ' + rules.monthYear(t) + '.';
  };
  var renderTableau = function() {
    var ui = window.dendryUI, engine = ui && ui.dendryEngine;
    if (!engine || !window.PolishEngineHooks || !window.PolishEngineHooks.deckView || typeof $ === 'undefined') {
      return;
    }
    var $tableau = $('#pl-tableau');
    if ($tableau.length) {
      $tableau.empty();
    } else {
      ui.$content.append($('<hr>'));
      ui.$content.append($('<p>').addClass('deck-description').text(uiText('tableau')));
      $tableau = $('<div>').attr('id', 'pl-tableau');
      // Z — 0.65: the decks and the Central Executive Committee share one board (see window.displayPinnedCards).
      ui.$content.append($('<div>').attr('id', 'pl-board').append($tableau));
    }
    DECK_IDS.forEach(function(deckId) {
      var view = window.PolishEngineHooks.deckView(engine, deckId);
      var $row = $('<div>').addClass('pl-deck-row');
      var $deck = $('<li>').addClass('deck');
      var $deckLink = $('<a>').addClass('card').attr({href: '#', 'card-id': deckId, title: view.title});
      if (view.image) {
        $deckLink.append($('<img>').addClass('card-img').attr({src: view.image, alt: view.title}));
      }
      if (!view.available) {
        $deck.addClass('unavailable-card');
        $deckLink.append($('<span>').addClass('card-tooltip').text(view.reason));
      }
      $deck.append($deckLink).append($('<span>').addClass('card-caption').text(view.title));
      if (!view.available) {
        $deck.append($('<span>').addClass('pl-deck-reason').text(view.reason));
      }
      $row.append($('<ul>').addClass('decks').append($deck));
      var $hand = $('<ul>').addClass('hand');
      for (var i = 0; i < Math.max(view.slots, view.cards.length); i++) {
        var card = view.cards[i];
        var $place = $('<li>').addClass('card-in-hand');
        if (card) {
          var $cardLink = $('<a>').addClass('card').attr({href: '#', 'card-id': card.id, title: card.title});
          if (card.image) {
            $cardLink.append($('<img>').addClass('card-img').attr({src: card.image, alt: card.title}));
          }
          if (card.until !== null && card.until !== undefined) {
            $cardLink.addClass('pl-timed');
            $cardLink.append($('<span>').addClass('pl-timed-badge').text(deadlineBadge(card.until)));
            $cardLink.append($('<span>').addClass('card-tooltip').text(deadlineText(card.until)));
          }
          $place.append($cardLink).append($('<span>').addClass('card-caption').text(card.title));
          var undiscardable = window.PolishRules.TIMED_CARDS.indexOf(card.id) >= 0 || window.PolishRules.VISION_CARDS.indexOf(card.id) >= 0 ||
            window.PolishRules.EVENT_CARDS.indexOf(card.id) >= 0;
          if (undiscardable) {
            $place.append($('<span>').addClass('pl-undiscardable').attr('title', card.discard.reason).text(uiText('undiscardable')));
          } else {
            var $button = $('<button>').addClass('pl-discard').attr({type: 'button', 'data-card-id': card.id}).text(uiText('discard'));
            if (!card.discard.available) {
              $button.addClass('pl-disabled').attr({'aria-disabled': 'true', title: card.discard.reason});
            }
            $place.append($button);
          }
        } else {
          $place.append($('<div>').addClass('blank-card').append($('<span>').text(uiText('free_place'))));
        }
        $hand.append($place);
      }
      $row.append($hand);
      $tableau.append($row);
    });
  };
  window.displayDecks = function(decks) {
  };
  window.displayHand = function(hand, maxCards) {
    renderTableau();
  };
  // Z — 0.65 (the user's note of 7 X 2026): the cards of the Central Executive Committee stand in a column to the right
  // of the decks, one under another, when the play field is wide enough (game.css, #pl-board); on a narrower page the
  // column goes under the decks. The markup and the click handler (ul.pinned-cards li a) are those of core.js.
  window.displayPinnedCards = function(cards) {
    var ui = window.dendryUI;
    if (!ui || typeof $ === 'undefined') {
      return;
    }
    var description = window.pinnedCardsDescription || 'Pinned cards - click a card to play.';
    var qualities = ui.dendryEngine && ui.dendryEngine.state.qualities;
    if (qualities && qualities.pinnedCardsDescription) {
      description = qualities.pinnedCardsDescription;
    }
    var $column = $('#pl-ckw');
    if ($column.length) {
      $column.empty();
    } else {
      $column = $('<div>').attr('id', 'pl-ckw');
      if ($('#pl-board').length) {
        $('#pl-board').append($column);
      } else {
        ui.$content.append($('<hr>')).append($column);
      }
    }
    $column.append($('<p>').addClass('pinned-text-description').text(description));
    var $list = $('<ul>').addClass('pinned-cards');
    cards.forEach(function(card) {
      var $link = $('<a>').addClass('card').attr({href: '#', 'card-id': card.id, title: card.title});
      if (card.image) {
        $link.append($('<img>').addClass('card-img').attr({src: card.image, alt: card.title}));
      }
      if (card.subtitle) {
        $link.append($('<span>').addClass('card-tooltip').text(card.subtitle));
      }
      $list.append($('<li>').addClass('pinned-card').append($link).append($('<span>').addClass('card-caption').text(card.title)));
    });
    $column.append($list);
  };
  var discardFromTableau = function(event) {
    event.preventDefault();
    event.stopPropagation();
    var $button = $(this);
    if ($button.hasClass('pl-disabled')) {
      return false;
    }
    var engine = window.dendryUI.dendryEngine, Q = engine.state.qualities, cardId = $button.attr('data-card-id');
    if (!window.PolishRules.discardStatus(Q, engine.state, cardId).available) {
      return false;
    }
    window.PolishRules.discardCard(Q, engine.state, cardId);
    window.dendryUI.autosave();
    renderTableau();
    return false;
  };

  // This function allows you to modify the text before it's displayed.
  // The effect numbers of choice descriptions are wrapped so that the Options setting can hide them (Z — 0.53).
  window.displayText = function(text) {
      return window.PolishRules && window.PolishRules.markEffectNumbers ? window.PolishRules.markEffectNumbers(text) : text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
  };

  // Z — 0.63 (decision 3A): the sidebar reads like a ledger. A fact "**Label:** value" gets its value in a span of its
  // own: a value that fits stands at the right end of the line after a dotted leader, a longer one goes under its label.
  // Only the presentation changes; the scenes and their texts stay as they are.
  var ledgerRows = function(root) {
    $(root).find('p').each(function() {
      var label = this.firstChild;
      if (!label || label.nodeName !== 'STRONG' || !/:\s*$/.test(label.textContent) || !label.nextSibling) {
        return;
      }
      var value = document.createElement('span');
      value.className = 'pl-val';
      while (label.nextSibling) {
        value.appendChild(label.nextSibling);
      }
      if (value.firstChild && value.firstChild.nodeType === 3) {
        value.firstChild.nodeValue = value.firstChild.nodeValue.replace(/^\s+/, '');
      }
      if (!value.textContent.trim()) {
        this.appendChild(value);
        return;
      }
      var dots = document.createElement('span');
      dots.className = 'pl-dots';
      this.appendChild(dots);
      this.appendChild(value);
      $(this).addClass('pl-row');
    });
    fitLedgerRows(root);
  };
  // A value that wraps inside its line is moved under its label. Without a layout (a hidden page), the length decides.
  var fitLedgerRows = function(root) {
    $(root).find('p.pl-row').each(function() {
      var $row = $(this).removeClass('pl-long');
      var value = $row.children('.pl-val')[0];
      var lineHeight = parseFloat(window.getComputedStyle(this).lineHeight) || 20;
      var long = this.offsetWidth ? value.offsetHeight > lineHeight * 1.5 :
        (this.firstChild.textContent + value.textContent).length > 36;
      $row.toggleClass('pl-long', long);
    });
  };
  var refitTimer = null;
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('resize', function() {
      clearTimeout(refitTimer);
      refitTimer = setTimeout(function() { fitLedgerRows('#qualities'); }, 150);
    });
  }

  // TODO: have some code for tabbed sidebar browsing.
  window.updateSidebar = function() {
      $('#qualities').empty();
      var scene = dendryUI.game.scenes[window.statusTab];
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));
      ledgerRows('#qualities');
  };

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  window.onDisplayContent = function() {
      window.updateSidebar();
  };

  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };


  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");

  window.increaseFontSize = function() {
        window.dendryUI.font_size += 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

  window.decreaseFontSize = function() {
        window.dendryUI.font_size -= 0.1;
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
        document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
        window.dendryUI.saveSettings();
  }

  // Z — 0.62: a failing game script is shown, not silent. The engine only logs the errors of scene scripts and
  // conditions ("Error:" or "Error in expression"); a stale cached rules file next to newer scenes once let the game go
  // on for months without elections or events. The page shows one notice per load and asks for a reload without the
  // cache. Outside a page (the Node test of the save check) there is no document and nothing is shown.
  var scriptErrorShown = false;
  var showScriptError = function() {
    if (scriptErrorShown || typeof document === 'undefined' || !document.body) {
      return;
    }
    scriptErrorShown = true;
    var box = document.createElement('div');
    box.className = 'pl-script-error';
    box.setAttribute('role', 'alert');
    var text = document.createElement('span');
    text.textContent = uiText('script_error');
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = uiText('script_error_close');
    close.onclick = function() {
      if (box.parentNode) {
        box.parentNode.removeChild(box);
      }
    };
    box.appendChild(text);
    box.appendChild(close);
    document.body.appendChild(box);
  };
  var nativeLog = console.log;
  console.log = function(first) {
    if (typeof first === 'string' && /^Error/.test(first)) {
      showScriptError();
    }
    return nativeLog.apply(console, arguments);
  };
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('error', showScriptError);
  }

  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: false});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    // Stage 8: a browser without saved settings has no font size yet; the default is 1.1em.
    if (typeof window.dendryUI.font_size !== 'number') {
        window.dendryUI.font_size = 1.1;
    }
    if (window.dendryUI.font_size != 1.1) {
        var fs = window.dendryUI.font_size;
        var sidebar_fs = fs - 0.1;
        document.getElementById("content").setAttribute("style", "font-size: " + fs + "em;");
        document.getElementById("stats_sidebar").setAttribute("style", "font-size: " + sidebar_fs + "em;");
    }
    document.getElementById('font_size_value').textContent = window.dendryUI.font_size.toFixed(1) + "em";
    window.pinnedCardsDescription = uiText('pinned');
    applyShowNumbers(storedShowNumbers());
    $(document).on('click', 'button.pl-discard', discardFromTableau);
  };

}());
