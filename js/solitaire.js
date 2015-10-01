/**
 *
 */
var solitaire = (function() {

  // Game element ids
  var GAME = 'solitaire';
  var LOAD = 'solitaire-game-loading';
  var DEAL = 'deal-btn';
  var STOCK = 'stock';
  var WASTE = 'waste';
  var FOUND = 'foundation';
  var HEARTS = 'hearts';
  var SPADES = 'spades';
  var DIAMONDS = 'diamonds';
  var CLUBS = 'clubs';
  var TAB = 'tableau';
  var TAB_1 = 'tableau-1';
  var TAB_2 = 'tableau-2';
  var TAB_3 = 'tableau-3';
  var TAB_4 = 'tableau-4';
  var TAB_5 = 'tableau-5';
  var TAB_6 = 'tableau-6';
  var TAB_7 = 'tableau-7';

  // Card and stack classes
  var STACK = 'solitaire-stack-container';
  var TOP = 'top-of-stack';
  var BASE = 'stack-placeholder';
  var DRAGGING = 'card-being-dragged';

  // Card img data attributes
  var DATA_RANK = 'data-rank';
  var DATA_SUIT = 'data-suit';

  // Image paths
  var PH_DEFAULT = 'img/placeholder-outline.svg';
  var PH_EMPTY = 'img/placeholder-empty.svg';
  var PH_STOCK = 'img/placeholder-stock.svg';
  var PH_HEARTS = 'img/placeholder-hearts.svg';
  var PH_SPADES = 'img/placeholder-spades.svg';
  var PH_DIAMONDS = 'img/placeholder-diamonds.svg';
  var PH_CLUBS = 'img/placeholder-clubs.svg';
  var CARD_BACK = 'img/back.svg';

  // Flag monitoring the state of the game.
  var gameInProgress = false;

  // Flag to block game controls used during 'You Win' animation.
  var blockControls = false;

  // Flag used to indicate when all card images.
  var loadedImages = 0;

  // Z-index value applied the last card to recieve interaction.
  // Ensures the card in focus always remains on top of other cards in game.
  var cardImgZIndex = 1;

  // Initialization ------------------------------------------------------------

  var init = function() {
    init.controls();
    init.stack();
    init.loading();
    init.deck();
  };

  init.controls = function() {
    var game = $('#' + GAME);
    var controls = $('<div id="controls"></div>');
    var dealBtn = $('<button id="' + DEAL + '">Deal</button>');
    controls.append(dealBtn);
    game.append(controls);
  };

  // A stack is a region on the solitaire game board where cards are piled.
  // Stacks are nested structures, with each card added nested in the previous.
  init.stack = function() {
    init.stack.containers();
    init.stack.placeholders();
  };

  // Appends stack container divs to the game container div
  init.stack.containers = function() {
    var game = $('#' + GAME);
    var stock = $('<div id="' + STOCK + '" class="' + STACK + '"></div>');
    var waste = $('<div id="' + WASTE + '" class="' + STACK + '"></div>');
    var foundation = $('<div id="' + FOUND + '"></div>');
    var tableau = $('<div id="' + TAB + '"></div>');
    var fStacks = [HEARTS, SPADES, DIAMONDS, CLUBS];
    for (var i = 0; i < fStacks.length; i++)
      foundation.append('<div id="' + fStacks[i] + '" class="' + STACK + '"></div>');
    var tStacks = [TAB_1, TAB_2, TAB_3, TAB_4, TAB_5, TAB_6, TAB_7];
    for (i = 0; i < tStacks.length; i++)
      tableau.append('<div id="' + tStacks[i] + '" class="' + STACK + '"></div>');
    var gameElements = [stock, waste, foundation, tableau];
    for (i = 0; i < gameElements.length; i++)
      game.append(gameElements[i]);
  };

  // Each card stack has a placeholder at it's base that displays
  // an image when no cards are in the stack.
  init.stack.placeholders = function() {
    $('#' + STOCK).append(init.stack.placeholders.dom(PH_STOCK));
    $('#' + WASTE).append(init.stack.placeholders.dom(PH_EMPTY));
    $('#' + HEARTS).append(init.stack.placeholders.dom(PH_HEARTS, 1));
    $('#' + SPADES).append(init.stack.placeholders.dom(PH_SPADES, 2));
    $('#' + DIAMONDS).append(init.stack.placeholders.dom(PH_DIAMONDS, 3));
    $('#' + CLUBS).append(init.stack.placeholders.dom(PH_CLUBS, 4));
    var tStacks = [TAB_1, TAB_2, TAB_3, TAB_4, TAB_5, TAB_6, TAB_7];
    for (var i = 0; i < tStacks.length; i++)
      $('#' + tStacks[i]).append(init.stack.placeholders.dom(PH_DEFAULT));
    init.stack.placeholders.bind();
  };

  // Builds and returns placeholder elements without appending.
  init.stack.placeholders.dom = function(imgPath, suit) {
    var div = $('<div></div>');
    var img = $('<img src="' + imgPath + '" />');
    if (suit)
      img.attr(DATA_SUIT, suit);
    div.append(img);
    div.addClass(BASE);
    div.addClass(TOP);
    return div;
  };

  // Binds click and drop events to card stack placeholder divs.
  init.stack.placeholders.bind = function() {
    init.stack.placeholders.bind.stockClick();
    init.stack.placeholders.bind.foundationDroppable();
    init.stack.placeholders.bind.tableauDroppable();
  };

  // Stock placeholder is clickable to refresh the pile with waste pile cards.
  init.stack.placeholders.bind.stockClick = function() {
    $('#' + STOCK).getPlaceholder().click(Click.emptyStock);
  };

  // Foundation stack placeholders are droppable to recieve 'Aces'.
  init.stack.placeholders.bind.foundationDroppable = function() {
    var f = [HEARTS, SPADES, DIAMONDS, CLUBS];
    for (var i = 0; i < f.length; i++)
      $('#' + f[i]).getPlaceholder().droppable(Droppable.foundationPlaceholder);
  };

  // Tableau stack placeholders are droppable to recieve 'Kings'.
  init.stack.placeholders.bind.tableauDroppable = function() {
    var t = [TAB_1, TAB_2, TAB_3, TAB_4, TAB_5, TAB_6, TAB_7];
    for (i = 0; i < t.length; i++)
      $('#' + t[i]).getPlaceholder().droppable(Droppable.tableauPlaceholder);
  };

  // Sets up game board to a loading state where no stacks are visible
  // and a loading div is present instead.
  init.loading = function() {
    var loading = $('<div id="' + LOAD + '">LOADING</div>');
    loading.insertAfter($('#' + GAME));
    $('#' + GAME).hide();
  };

  // Preloads card back image and calls init.loading.complete to display game.
  // See init.deck.dom.
  // Also, preloads other images not required until later.
  init.loading.cardFrontsComplete = function() {
    $('<img src="' + CARD_BACK +'"/>').load(function() {
      $('#' + LOAD).remove();
      $('#' + GAME).fadeIn();
    });
    //*******************************************************************
    // TODO Preload win images so they display without delay
    //*******************************************************************
  };

  // Restores game board visibility and removes loading div.
  init.loading.complete = function() {
    $('#' + LOAD).remove();
    $('#' + GAME).fadeIn();
  };

  // Sets up deck such that 52 shuffled cards are face down in the stock pile.
  init.deck = function() {
    var cards = init.deck.shuffle(init.deck.dom());
    for (var i = 0; i < cards.length; i++) {
      init.deck.card(cards[i]);
    }
  };

  // Returns card elements ordered by rank and suit in an array.
  init.deck.dom = function() {
    var cards = [];
    for (var card = 1; card <= 52;) {
      for (var suit = 1; suit <= 4; suit++, card++) {
        cards[card - 1] = $('<div></div>');
        var rank = Math.ceil(card / 4);
        var filename = rank + '-' + Suit.toString(suit);
        var img = $('<img src="img/' + filename + '.svg" />');
        img.load(function() {
          loadedImages++;
          if (loadedImages == 52) {
            init.loading.cardFrontsComplete();
          }
        });
        img.attr(DATA_RANK, rank);
        img.attr(DATA_SUIT, suit);
        cards[card - 1].append(img);
      }
    }
    return cards;
  };

  // Shuffles an array, or this case our deck of card elements.
  init.deck.shuffle = function(cards) {
    var currentIndex = cards.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = cards[currentIndex];
      cards[currentIndex] = cards[randomIndex];
      cards[randomIndex] = temporaryValue;
    }
    return cards;
  };

  // Sets card state 'face down' an appends the card to the stock stack.
  init.deck.card = function(card) {
    card.setFaceUp(false);
    card.css({
      'background-image': 'url(' + CARD_BACK + ')',
      'background-size': '100%',
      'background-repeat': 'no-repeat'
    });
    card.addClass(TOP);
    card.addToTopOf($('#' + STOCK));
  };

  // Removes all card elements from all stacks.
  init.deck.clear = function() {
    var s = [STOCK, WASTE, HEARTS, SPADES, DIAMONDS, CLUBS,
             TAB_1, TAB_2, TAB_3, TAB_4, TAB_5, TAB_6, TAB_7];
    for (var i = 0; i < s.length; i++) {
      $('#' + s[i]).getAllCards().remove();
      $('#' + s[i]).children('div:first').addClass(TOP);
    }
    cardImgZIndex = 1;
  };

  var reinit = function() {
    gameInProgress = false;
    init.deck.clear();
    init.deck();
    blockControls = false;
  };

  // Game play -----------------------------------------------------------------

  var deal = function() {
    if (!blockControls) {
      if (gameInProgress)
        reinit();
      deal.cards();
      gameInProgress = true;
    }
  };

  deal.cards = function() {
    for (var i = 1; i <= 28; i++) {
      var card = $('#' + STOCK).getTopCard();
      if ( i==1 || i==8 || i==14 || i==19 || i==23 || i==26 || i==28 )
        card.setFaceUp(true);
      if ( i==1 )
        card.moveTo($('#' + TAB_1));
      else if ( i==2 || i==8 )
        card.moveTo($('#' + TAB_2));
      else if ( i==3 || i==9  || i==14 )
        card.moveTo($('#' + TAB_3));
      else if ( i==4 || i==10 || i==15 || i==19 )
        card.moveTo($('#' + TAB_4));
      else if ( i==5 || i==11 || i==16 || i==20 || i==23 )
        card.moveTo($('#' + TAB_5));
      else if ( i==6 || i==12 || i==17 || i==21 || i==24 || i==26 )
        card.moveTo($('#' + TAB_6));
      else if ( i==7 || i==13 || i==18 || i==22 || i==25 || i==27 || i==28 )
        card.moveTo($('#' + TAB_7));
    }
  };

  // Animates cards back into stock, displays win message, and re-initializes.
  var win = function() {
    win.displayMessage();
    win.animateCards();
  };

  // Calls win if the user has won the game, otherwise returns false.
  // This method is called whenever the user places a 'King' in foundation.
  win.check = function() {
    var winStatus = true;
    var foundation = [HEARTS, SPADES, DIAMONDS, CLUBS];
    for (var i = 0; i < foundation.length; i++) {
      if (! ($('#' + foundation[i]).getTopCard().hasRank(13)))
        return false;
    }
    win();
  };

  // Displays 'YOU WIN' on the 7 empty tableau stacks for short-period
  // then re-initializes the game.
  win.displayMessage = function() {
    blockControls = true;

    $('#' + TAB_1).changePlaceholderImg('img/joker-red.svg');
    $('#' + TAB_2).changePlaceholderImg('img/joker-red.svg');
    $('#' + TAB_3).changePlaceholderImg('img/joker-red.svg');
    $('#' + TAB_5).changePlaceholderImg('img/joker-red.svg');
    $('#' + TAB_6).changePlaceholderImg('img/joker-red.svg');
    $('#' + TAB_7).changePlaceholderImg('img/joker-red.svg');
    window.setTimeout(function() {
      var tStacks = [TAB_1, TAB_2, TAB_3, TAB_5, TAB_6, TAB_7];
      for (var i = 0; i < tStacks.length; i++) {
        $('#' + tStacks[i]).changePlaceholderImg(PH_DEFAULT);
      }
      reinit();
      blockControls = false;
    }, 2500);
  };

  // Animates all cards back into the stock.
  win.animateCards = function() {
    var stockPosition = $('#' + STOCK).position();
    var fStacks = [HEARTS, SPADES, DIAMONDS, CLUBS];
    for (var i = 0; i < fStacks.length; i++) {
      fStack = $('#' + fStacks[i]);
      fStackPosition = fStack.position();
      var diffTop = stockPosition.top - fStackPosition.top;
      var diffLeft = stockPosition.left - fStackPosition.left;
      var cardsOnly = fStack.getPlaceholder().children('div:first');
      if (cardsOnly) {
        cardsOnly.preserveDimenisions();
        cardsOnly.animate({
          'top' : diffTop,
          'left' : diffLeft
        }, 1000);
      }
    }
  };

  var Click = {

    // Moves wastes cards into the stock and sets them face down.
    emptyStock : function(event) {
      var numWasteCards = $('#' + WASTE).sizeOfStack();
      while (numWasteCards > 0) {
        $('#' + WASTE).getTopCard().setFaceUp(false).moveTo($('#' + STOCK));
        numWasteCards--;
      }
    },

    // Moves stock card to the waste pile and sets face up.
    cardInStock : function(event) {
      event.stopPropagation();
      event.preventDefault();
      if (gameInProgress)
        $(this).setFaceUp(true).moveTo($('#' + WASTE));
    },

    // Flips card up and binds tableau event handlers.
    faceDownTopCardInTableau : function(event) {
      $(this).setFaceUp(true);
      $(this).draggable(Draggable.card).droppable(Droppable.tableauCard);
      $(this).dblclick(Click.Double.faceUpTopCard).unbind('click');
    },

    Double : {
      // Automatically moves the card to foundation if valid play available.
      faceUpTopCard : function(event) {
        event.stopPropagation();
        event.preventDefault();
        var rank = $(this).getRank();
        var suit = $(this).getSuit();
        var fStack = $(this).getFoundationStack();
        var fRank = fStack.getTopCard().getRank();
        var isAce = (rank == 1) && (fStack.sizeOfStack() === 0);
        var rankIsValid = (rank == fRank + 1);
        if (isAce)
          $(this).moveTo(fStack);
        else if (rankIsValid)
          $(this).moveTo(fStack);
      }
    } // Double

  }; // Click

  var Draggable = {
    // All face up card are draggable
    card : {
      containment: "html",
      scroll: false,
      revert: "invalid",
      start: function(event, ui) {
        $(this).preserveDimenisions();
        $(this).cascadeZindex();
        $(this).getImg().addClass(DRAGGING);
      },
      stop: function(event, ui) {
        $(this).restoreFlexibility();
        $(this).getImg().removeClass(DRAGGING);
      }
    }

  }; // Draggable

  var Droppable = {

    // Accepts aces with matching suit.
    foundationPlaceholder : {
      accept: function(event) {
        var suitsMatch = $(this).getSuit() == event.getSuit();
        var isAce = event.getRank() == 1;
        if (suitsMatch && isAce)
          return true;
      },
      drop: function(event, ui) {
        ui.draggable.moveTo(ui.draggable.getFoundationStack());
      }
    },

    // Accepts single card with matching suit and rank 1 greater.
    foundationCard : {
      accept: function(event) {
        var draggingMultipleCards = event.children('div').length;
        if (!draggingMultipleCards) {
          var suitsMatch = $(this).getSuit() == event.getSuit();
          var rankIsValid = $(this).getRank() == (event.getRank() - 1);
          if (suitsMatch && rankIsValid)
            return true;
        }
      },
      drop: function(event, ui) {
        ui.draggable.moveTo(ui.draggable.getFoundationStack());
      }
    },

    // Accepts any 'King'
    tableauPlaceholder : {
      accept: function(draggable) {
        return draggable.hasRank(13);
      },
      drop: function(event, ui) {
        ui.draggable.moveTo($(this).getStack());
      }
    },

    // Accepts card with opposite color and rank 1 less.
    tableauCard : {
      accept: function(event) {
        var colorsAreOpposite = !Suit.match($(this).getSuit(), event.getSuit());
        var rankIsValid = $(this).getRank() == (event.getRank() + 1);
        if (colorsAreOpposite && rankIsValid)
          return true;
      },
      drop: function(event, ui) {
        ui.draggable.moveTo($(this).getStack());
      }
    }

  }; // Droppable

  // Card plugins --------------------------------------------------------------

  // Throws an error if the calling object is not a card.
  jQuery.fn.card = function() {
    try {
      var isPlaceholder = $(this).hasClass(BASE);
      var isCard = $(this).children('img').attr(DATA_RANK);
      if (!(isPlaceholder || isCard))
        throw new Error('Calling element is not a card or placeholder');
    } catch(e) {
      console.log(e);
    }
    return this;
  };

  // Moves this card to a new stack.
  jQuery.fn.moveTo = function(newStack) {
    var card = $(this).card();
    var currentStack = card.getStack();
    card = card.removeFrom(currentStack);
    card.addToTopOf(newStack);
    return card;
  };

  // Removes this card from it's current stack and returns.
  jQuery.fn.removeFrom = function(stack) {
    var card = $(this).card();
    var newTopCard = card.parent();
    newTopCard.addClass(TOP);

    if (stack.isInTableau()) {
      if (newTopCard.isFaceUp() && !newTopCard.isPlaceholder()) {
        newTopCard.droppable(Droppable.tableauCard);
        newTopCard.dblclick(Click.Double.faceUpTopCard);
      } else {
        newTopCard.click(Click.faceDownTopCardInTableau);
      }
    }

    var returnCard = card.detach();
    returnCard.unbind('click');
    if (returnCard.data('ui-droppable'))
      returnCard.droppable('destroy');
    return returnCard;
  };

  // Adds card to the top a of stack.
  jQuery.fn.addToTopOf = function(stack) {
    var newTopCard = $(this).card();
    var oldTopCard = stack.getTopCard();
    oldTopCard.append(newTopCard);
    oldTopCard.removeClass(TOP);
    newTopCard.cascadeZindex();
    newTopCard.positionOn(stack);
    if (stack.is($('#' + STOCK))) {
      newTopCard.bindStockCardListeners();
    } else if (stack.is($('#' + WASTE))) {
      newTopCard.bindWasteCardListeners();
    } else if (newTopCard.getStack().parent().attr('id') == FOUND) {
      newTopCard.bindFoundationCardListeners();
      if (newTopCard.hasRank(13))
        win.check();
    } else if (newTopCard.getStack().isInTableau) {
      newTopCard.bindTableauTopCardListeners();
      oldTopCard.unbindTableauTopCardListeners();
    } else {
      console.log('addToTopOfStack: No matching stack found');
    }
    return newTopCard;
  };

  jQuery.fn.bindStockCardListeners = function() {
    var card = $(this).card();
    if (card.getStack().is('#' + STOCK))
      $(this).card().click(Click.cardInStock);
  };

  jQuery.fn.bindWasteCardListeners = function() {
    var card = $(this).card();
    if (card.getStack().is('#' + WASTE)) {
      card.draggable(Draggable.card);
      card.dblclick(Click.Double.faceUpTopCard);
    }
  };

  jQuery.fn.bindFoundationCardListeners = function() {
    var card = $(this).card();
    if (card.getStack().isInFoundation()) {
      card.draggable(Draggable.card);
      card.droppable(Droppable.foundationCard);
    }
  };

  jQuery.fn.bindTableauTopCardListeners = function() {
    var card = $(this).card();
    if (card.isFaceUp() && !(card.hasClass(BASE))) {
      card.draggable(Draggable.card); // all cards in stack must be draggable
      card.droppable(Droppable.tableauCard);
      card.dblclick(Click.Double.faceUpTopCard);
    }
  };

  jQuery.fn.unbindTableauTopCardListeners = function() {
    var card = $(this).card();
    if (card.data('ui-droppable') && !card.hasClass(BASE)) {
      // once draggable all cards remain draggable
      card.droppable('destroy');
      card.unbind('dblclick');
    }
  };

  // Applies card offset depending upon stack
  jQuery.fn.positionOn = function(stack) {
    var card = $(this).card();
    if (stack.isInTableau() && !card.isOnBottom())
      card.css({ 'position': 'absolute', 'top': '20%', 'left': '0' });
    else
      card.css({ 'position': 'absolute', 'top': '0', 'left': '0' });
  };

  // When user interacts with a card it's z-index is increased to ensure it
  // is not overlapped by other cards. If user interacts with card (i.e. drags)
  // in the middle of a stack the z-index increase needs to also be applied
  // to all cards on top of the card being moved, thus we cascase...
  jQuery.fn.cascadeZindex = function() {
    var cardAtBaseOfNestedStack = $(this).card();
    while (cardAtBaseOfNestedStack.length) {
      cardAtBaseOfNestedStack.getImg().css('z-index', cardImgZIndex);
      cardImgZIndex++;
      cardAtBaseOfNestedStack = cardAtBaseOfNestedStack.children('div');
    }
  };

  // Sets card face up or face down depending on value of 'isFaceUp'.
  jQuery.fn.setFaceUp = function(isFaceUp) {
    var card = $(this).card();
    if (isFaceUp)
      $(this).getImg().css('visibility', 'visible');
    else
      $(this).getImg().css('visibility', 'hidden');
    return this;
  };

  // Returns this card's stack container.
  jQuery.fn.getStack = function() {
    var card = $(this).card();
    return card.parents('.' + STACK).first();
  };

  // Returns the foundation stack of same suit as this card.
  jQuery.fn.getFoundationStack = function() {
    var card = $(this).card();
    var suit = card.getSuit();
    return $('#' + FOUND).children().eq(suit - 1);
  };

  // Returns this card's img element.
  jQuery.fn.getImg = function() {
    return $(this).card().children('img:first');
  };

  // Returns this card's rank as integer.
  jQuery.fn.getRank = function() {
    return parseInt($(this).card().getImg().attr(DATA_RANK));
  };

  // Returns this card's suit as integer.
  jQuery.fn.getSuit = function() {
    return parseInt($(this).card().getImg().attr(DATA_SUIT));
  };

  // Returns true if this card has rank.
  jQuery.fn.hasRank = function(rank) {
    return $(this).getRank() == rank;
  };

  // Returns true if this card is face up.
  jQuery.fn.isFaceUp = function() {
    return $(this).getImg().css('visibility') == 'visible';
  };

  // Returns true if this card is on bottom of its stack.
  jQuery.fn.isOnBottom = function() {
    return $(this).card().parent().isPlaceholder();
  };

  // Returns true if this card is the stack placeholder.
  jQuery.fn.isPlaceholder = function() {
    return $(this).card().hasClass(BASE);
  };

  // Fixes this cards dimensions. Applied during drag.
  jQuery.fn.preserveDimenisions = function() {
    var card = $(this).card();
    card.css({ 'width': card.width() +'px', 'height': card.height() +'px' });
  };

  // Returns this cards dimensions to a flexible state based on stack container.
  // Applied after drag is complete.
  jQuery.fn.restoreFlexibility = function() {
    $(this).card().css({ 'width': '100%', 'height': 'auto' });
  };

  // Stack plugins -------------------------------------------------------------

  // Throws an error if the calling object is not a stack container div.
  jQuery.fn.stack = function() {
    try {
      if (!($(this).hasClass(STACK)))
        throw new Error('Calling element is not a stack container div');
    } catch(e) {
      console.log(e);
    }
    return this;
  };

  // Returns the top card on this stack.
  jQuery.fn.getTopCard = function() {
    return $(this).stack().find('.' + TOP);
  };

  // Returns all cards on this stack.
  jQuery.fn.getAllCards = function() {
    return $(this).stack().find('div').not('.' + BASE);
  };

  // Returns true if calling stack is in the tableau.
  jQuery.fn.isInTableau = function() {
    return $(this).stack().parent().is('#' + TAB);
  };

  // Returns true if calling stack is in the foundation.
  jQuery.fn.isInFoundation = function() {
    return $(this).stack().parent().is('#' + FOUND);
  };

  // Returns the stack placeholder.
  jQuery.fn.getPlaceholder = function() {
    return $(this).stack().children('.' + BASE + ':first');
  };

  // Changes the placeholder image with fade out/in effect.
  // Requires image preloading.
  jQuery.fn.changePlaceholderImg = function(imgPath) {
    var image = $(this).getPlaceholder().getImg();
    image.fadeOut('fast', function () {
        image.attr('src', imgPath);
        image.fadeIn('fast');
    });
  };

  // Returns the number of cards in stack (not including placeholder).
  jQuery.fn.sizeOfStack = function() {
    return $(this).getAllCards().length;
  };

  // Suit ----------------------------------------------------------------------

  var Suit = {
    HEART: 1,
    SPADE: 2,
    DIAMOND: 3,
    CLUB: 4,

    toString : function(suit) {
      switch(parseInt(suit)) {
        case this.HEART: return 'hearts';
        case this.SPADE: return 'spades';
        case this.DIAMOND: return 'diamonds';
        case this.CLUB: return 'clubs';
        default: return 'Invalid suit integer';
      }
    },

    getColor : function(suit) {
      return ((suit === this.HEART) || (suit === this.DIAMOND)) ?
          Suit.Color.RED :
          Suit.Color.BLACK;
    },

    match : function(suit1, suit2) {
      return Suit.getColor(parseInt(suit1)) == Suit.getColor(parseInt(suit2));
    },

    Color : { RED: 1, BLACK: 2 }

  }; // Suit

  //----------------------------------------------------------------------------

  $(document).ready(function(){
    init();

    $('#' + DEAL).click(function() {
      deal();
    });

    $('#test-win').click(function() {
      win.check();
    });


  });

})(); // solitaire
