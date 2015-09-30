var solitaire = (function() {

  // Game element ids
  var GAME = 'solitaire';
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

  // Card classes
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

  // Z-index value applied the last card to recieve interaction.
  // Ensures the card in focus always remains on top of other cards in game.
  var cardImgZIndex = 1;

  //---------- Initialization --------------------------------------------------

  var init = function() {
    init.stack();
    init.deck();
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
    $('#' + HEARTS).append(init.stack.placeholders.dom(PH_HEARTS));
    $('#' + DIAMONDS).append(init.stack.placeholders.dom(PH_DIAMONDS));
    $('#' + SPADES).append(init.stack.placeholders.dom(PH_SPADES));
    $('#' + CLUBS).append(init.stack.placeholders.dom(PH_CLUBS));
    var tStacks = [TAB_1, TAB_2, TAB_3, TAB_4, TAB_5, TAB_6, TAB_7];
    for (var i = 0; i < tStacks.length; i++)
      $('#' + tStacks[i]).append(init.stack.placeholders.dom(PH_DEFAULT));
    init.stack.placeholders.bind();
  };

  // Builds and returns placeholder elements without appending.
  init.stack.placeholders.dom = function(imgPath) {
    var div = $('<div></div>');
    div.append('<img src="' + imgPath +'" />');
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

  init.deck = function() {
    var cards = init.deck.shuffle(init.deck.dom());
    for (var i = 0; i < cards.length; i++) {
      init.deck.card(cards[i]);
    }
  };

  // Returns card elements in an ordered array.
  init.deck.dom = function() {
    var cards = [];
    for (var card = 1; card <= 52;) {
      for (var suit = 1; suit <= 4; suit++, card++) {
        cards[card - 1] = $('<div></div>');
        var rank = Math.ceil(card / 4);
        var filename = rank + '-' + Suit.toString(suit);
        var img = $('<img src="img/' + filename + '.svg" />');
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

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // addToTopOf
  // setFaceUp
  // getAllCards()














  //---------- Dealing ---------------------------------------------------------

  var deal = function() {
    if (gameInProgress) {
      gameInProgress = false;
      init.deck.clear();
      init.deck();
    }
    deal.cards();
    gameInProgress = true;
  };

  deal.cards = function() {
    for (var i = 1; i <= 28; i++) {
      var card = $('#' + STOCK).getTopCard();
      if ( i==1 || i==8 || i==14 || i==19 || i==23 || i==26 || i==28 )
        card.setFaceUp(true);
      if ( i==1 )
        card.changeStack($('#' + STOCK), $('#' + TAB_1));
      else if ( i==2 || i==8 )
        card.changeStack($('#' + STOCK), $('#' + TAB_2));
      else if ( i==3 || i==9  || i==14 )
        card.changeStack($('#' + STOCK), $('#' + TAB_3));
      else if ( i==4 || i==10 || i==15 || i==19 )
        card.changeStack($('#' + STOCK), $('#' + TAB_4));
      else if ( i==5 || i==11 || i==16 || i==20 || i==23 )
        card.changeStack($('#' + STOCK), $('#' + TAB_5));
      else if ( i==6 || i==12 || i==17 || i==21 || i==24 || i==26 )
        card.changeStack($('#' + STOCK), $('#' + TAB_6));
      else if ( i==7 || i==13 || i==18 || i==22 || i==25 || i==27 || i==28 )
        card.changeStack($('#' + STOCK), $('#' + TAB_7));
    }
  };

  //-----------

  var win = win || {};

  win.check = function() {
    var foundation = [$('#' + HEARTS), $('#' + SPADES), $('#' + DIAMONDS), $('#' + CLUBS)];
    for (var i = 0; i < foundation.length; i++) {
      if (foundation[i].getAllCards().length != 13) {
        console.log('YOU DID NOT WIN');
        return false;
      }
    }
    console.log('YOU WIN!!!!');
    return true;
  }

  //---------- Click Handlers --------------------------------------------------

  var Click = Click || {};

  Click.emptyStock = function(event) {
    //
    //
    var cardsInWaste = $('#' + WASTE).sizeOfStack();
    while (cardsInWaste > 0) {
      $('#' + WASTE).getTopCard().setFaceUp(false).changeStack($('#' + WASTE), $('#' + STOCK));
      cardsInWaste--;
    }
  };

  Click.cardInStock = function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (gameInProgress) {
      var card = $(this);
      card.setFaceUp(true);
      card.changeStack($('#' + STOCK), $('#' + WASTE));
    }
  };

  Click.faceDownCardInTableau = function(event) {
    //
    //
    $(this).setFaceUp(true);
    $(this).draggable(Draggable.card);
    $(this).droppable(Droppable.tableau);
    $(this).dblclick(Click.doubleClickTopCardInTableau);
    $(this).unbind('click');
  };

  Click.doubleClickTopCardInTableau = function(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('dblclick');
    var rank = parseInt($(this).getRank());
    var suit = $(this).getSuit();
    var fStack = Stack.getFoundationStackWithSuit(suit);
    var fRank = parseInt(fStack.getTopCard().getRank());
    var addAceToEmptyStack = (rank == 1) && (fStack.sizeOfStack() == 0);
    var rankIsValid = (rank == fRank + 1);
    if (addAceToEmptyStack) {
      console.log('Add Ace: ' + rank + ', ' + fRank);
      $(this).changeStack($(this).getStack(), fStack);
    }
    if (rankIsValid) {
      console.log('Rank good: ' + rank + ', ' + fRank);
      $(this).changeStack($(this).getStack(), fStack);
    }

  };

  //---------- Draggables ------------------------------------------------------

  var Draggable = Draggable || {};

  Draggable.card = {
    containment: "html",
    scroll: false,
    revert: "invalid",
    start:  function(event, ui) {
      $(this).preserveDimenisions();
      $(this).incrementNestedStackZIndex();
      $(this).getImg().addClass(DRAGGING);
    },
    stop:   function(event, ui) {
      $(this).restoreFlexibility();
      $(this).getImg().removeClass(DRAGGING);
    }
  };

  //---------- Droppable -------------------------------------------------------

  var Droppable = Droppable || {};

  Droppable.foundationPlaceholder = {
    accept: function(event) {
      var draggableSuit = event.getImg().attr(DATA_SUIT);
      var draggableRank = event.getImg().attr(DATA_RANK);
      var droppableSuit = $(this).parent().attr('id');
      var suitsMatch = droppableSuit == Suit.toString(draggableSuit);
      var isAce = draggableRank == 1;
      if (suitsMatch && isAce) {
        return true;
      }
    },
    drop: function(event, ui) {
      var dragStack = ui.draggable.getStack();
      var dropStack = $(this).parent();
      ui.draggable.changeStack(dragStack, dropStack).css({
        'position': 'absolute',
        'top': '0',
        'left': '0'
      });
    }
  };

  Droppable.foundation = {
    accept: function(event) {

      // TODO: requires testing
      var draggableInNestedStack = event.children('div').length;

      var draggableSuit = event.getImg().attr(DATA_SUIT);
      var draggableRank = parseInt(event.getImg().attr(DATA_RANK));
      var droppableSuit = $(this).getImg().attr(DATA_SUIT);
      var droppableRank = parseInt($(this).getImg().attr(DATA_RANK));
      var suitsMatch = droppableSuit == draggableSuit;
      var rankIsValid = droppableRank == (draggableRank - 1);

      if (!draggableInNestedStack && suitsMatch && rankIsValid) {
        return true;
      }
    },
    drop: function(event, ui) {
      var dragStack = ui.draggable.getStack();
      var dropStack = $(this).parent();
      ui.draggable.changeStack(dragStack, dropStack).css({
        'position': 'absolute',
        'top': '0',
        'left': '0'
      });

    }
  };

  Droppable.tableauPlaceholder = {
    accept: function(draggable) {

      return draggable.hasRank(13);
    },
    drop: function(event, ui) {
      var dragStack = ui.draggable.getStack();
      var dropStack = $(this).parent();
      ui.draggable.changeStack(dragStack, dropStack).css({
        'position': 'absolute',
        'top': '0',
        'left': '0'
      });
    }

  };

  Droppable.tableauPlaceholder.validateDraggableIsKing = function(card) {
    var rank = parseInt(card.getImg().attr(DATA_RANK));
    if (rank == 13) return true;
  };

  Droppable.tableau = {
    accept: function(event) {
      var dragStack = event.getStack();
      var dropStack = $(this).parent();

      var draggableSuit = event.getImg().attr(DATA_SUIT);
      var draggableRank = parseInt(event.getImg().attr(DATA_RANK));
      var droppableSuit = $(this).getImg().attr(DATA_SUIT);
      var droppableRank = parseInt($(this).getImg().attr(DATA_RANK));

      var colorsAreOpposite = !Suit.colorsMatch(draggableSuit, droppableSuit);
      var rankIsValid = droppableRank == (draggableRank + 1);
      if (colorsAreOpposite && rankIsValid) {
        return true;
      }
    },
    drop: function(event, ui) {
      var dragStack = ui.draggable.getStack();
      var dropStack = $(this).getStack();
      if (dropStack.sizeOfStack() > 0) {
        ui.draggable.changeStack(dragStack, dropStack).css({
          'position': 'absolute', 'top':'20%', 'left': '0'
        });
      } else {
        ui.draggable.changeStack(dragStack, dropStack).css({
          'position': 'absolute', 'top':'0', 'left': '0'
        });
      }
    }
  };

  //---------- Card and stack manipulation -------------------------------------

  // Throws an error if the calling object is not a card.
  jQuery.fn.card = function() {
    try {
      if (!($(this).children('img').attr(DATA_RANK)))
        throw new Error('Calling element is not a card');
    } catch(e) {
      console.log(e);
    }
    return this;
  }

  // Adds card to the top a of stack.
  jQuery.fn.addToTopOf = function(stack) {
    var newTopCard = $(this).card(); // integrate with code below
    var parent = stack.getTopCard(); // oldTopCard rename

    if (!gameInProgress)
      $(this).addClass(TOP);

    parent.append($(this));
    parent.removeClass(TOP);

    $(this).incrementNestedStackZIndex();

    if (stack.applyOffset() && stack.sizeOfStack() > 1)
      $(this).css({ 'position': 'absolute', 'top': '20%' });

    if (stack.is($('#' + STOCK))) {
      $(this).click(Click.cardInStock);

    } else if (stack.is($('#' + WASTE))) {

      $(this).draggable(Draggable.card);
      $(this).dblclick(Click.doubleClickTopCardInTableau);

    } else if ($(this).getStack().parent().attr('id') == FOUND) {

      $(this).draggable(Draggable.card);
      $(this).droppable(Droppable.foundation);

      $(this).css({
        'position': 'absolute', 'top':'0', 'left': '0'
      });

      if ($(this).hasRank(13)) {
        win.check();
      }

    } else if ($(this).getStack().parent().attr('id') == TAB) {

      if ($(this).isFaceUp() && !($(this).hasClass(BASE))) {
        $(this).draggable(Draggable.card); // all cards in stack must be draggable
        $(this).droppable(Droppable.tableau);
        $(this).dblclick(Click.doubleClickTopCardInTableau);
      }

      if (parent.data('ui-droppable') && !parent.hasClass(BASE)) {
        parent.droppable('destroy');
        parent.unbind('dblclick');
      }

    } else {
      console.log('addToTopOfStack: No matching stack found');
    }
    return $(this);
  };

  //
  jQuery.fn.setFaceUp = function(isFaceUp) {
    var card = $(this).card();
    if (isFaceUp)
      $(this).getImg().css('visibility', 'visible');
    else
      $(this).getImg().css('visibility', 'hidden');
    return this;
  };

  jQuery.fn.changeStack = function(from, to) {
    var card = $(this).removeFrom(from);
    card.addToTopOf(to);
    return card;
  };

  jQuery.fn.removeFrom = function(stack) {
    // TODO UNBIND ALL CLICK AND DRAG AND DROP EVENTS
    $(this).unbind('dblclick');
    $(this).unbind('click');

    var parent = $(this).parent();
    parent.addClass(TOP);

    if (stack.parent().attr('id') == TAB) {
      if (parent.isFaceUp() && !parent.hasClass(BASE)) {
        parent.droppable(Droppable.tableau);
        parent.dblclick(Click.doubleClickTopCardInTableau);
      }
      else {
        parent.click(Click.faceDownCardInTableau);
      }
    }

    //return $(this).remove();
    var returnCard = $(this).detach();
    returnCard.unbind('click');
    if (returnCard.data('ui-droppable')) {
      returnCard.droppable('destroy');
    }

    return returnCard;
  };

  jQuery.fn.getStack = function() {
    if ($(this).parents('#' + STOCK).length > 0) return $('#' + STOCK);
    if ($(this).parents('#' + WASTE).length > 0) return $('#' + WASTE);
    if ($(this).parents('#' + HEARTS).length > 0) return $('#' + HEARTS);
    if ($(this).parents('#' + SPADES).length > 0) return $('#' + SPADES);
    if ($(this).parents('#' + DIAMONDS).length > 0) return $('#' + DIAMONDS);
    if ($(this).parents('#' + CLUBS).length > 0) return $('#' + CLUBS);
    if ($(this).parents('#' + TAB_1).length > 0) return $('#' + TAB_1);
    if ($(this).parents('#' + TAB_2).length > 0) return $('#' + TAB_2);
    if ($(this).parents('#' + TAB_3).length > 0) return $('#' + TAB_3);
    if ($(this).parents('#' + TAB_4).length > 0) return $('#' + TAB_4);
    if ($(this).parents('#' + TAB_5).length > 0) return $('#' + TAB_5);
    if ($(this).parents('#' + TAB_6).length > 0) return $('#' + TAB_6);
    if ($(this).parents('#' + TAB_7).length > 0) return $('#' + TAB_7);
    else console.log('getStack: no parent stack found');
  };

  jQuery.fn.getImg = function() {
    return $(this).children('img:first');
  };

  jQuery.fn.getRank = function() {
    return $(this).getImg().attr(DATA_RANK);
  };

  jQuery.fn.getSuit = function() {
    return $(this).getImg().attr(DATA_SUIT);
  };

  jQuery.fn.hasRank = function(rank) {
    return $(this).getImg().attr(DATA_RANK) == rank;
  };

  jQuery.fn.isFaceUp = function() {
    return $(this).getImg().css('visibility') == 'visible';
  };

  jQuery.fn.preserveDimenisions = function() {
    $(this).css({
      'width': $(this).width() +'px',
      'height': $(this).height() +'px'
    });
  };

  jQuery.fn.restoreFlexibility = function() {
    $(this).css({
      'width': '100%',
      'height': 'auto'
    });
  };

  //----------------------------------------------------------------------------
  var Stack = Stack || {};

  // Throws an error if the calling object is not a stack container div.
  jQuery.fn.stack = function() {
    try {
      if (!($(this).hasClass(STACK))) {
        throw new Error('Calling element is not a stack container div');
      }
    } catch(e) {
      console.log(e);
    }
    return this;
  }

  // Returns the top card on the stack.
  jQuery.fn.getTopCard = function() {
    return $(this).stack().find('.' + TOP);
  };

  jQuery.fn.incrementNestedStackZIndex = function(callback) {
    var that = $(this);
    while (that.length) {
      that.getImg().css('z-index', cardImgZIndex);
      cardImgZIndex++;
      that = that.children('div');
    }
  };

  jQuery.fn.getAllCards = function() {
    return $(this).find('div').not('.' + BASE);
  };

  jQuery.fn.getPlaceholder = function() {
    var placeholder = $(this).children('div:first');
    try {
      if (!placeholder.hasClass(BASE)) {
        throw new Error('Calling element is not a stack container div');
      }
    } catch(e) {
      console.log(e);
      placeholder = null;
    }
    return placeholder;
  };

  jQuery.fn.sizeOfStack = function() {
    return $(this).getAllCards().length;
  };

  jQuery.fn.applyOffset = function() {
    var tabs = [$('#' + TAB_1),$('#' + TAB_2),$('#' + TAB_3),$('#' + TAB_4),$('#' + TAB_5),$('#' + TAB_6),$('#' + TAB_7)];
    for (var i = 0; i < tabs.length; i++) {
      if (Stack.equal($(this), tabs[i])) return true;
    }
    return false;
  };

  Stack.getFoundationStackWithSuit = function(suit) {
    if (suit == Suit.HEART) return $('#' + HEARTS);
    if (suit == Suit.SPADE) return $('#' + SPADES);
    if (suit == Suit.DIAMOND) return $('#' + DIAMONDS);
    if (suit == Suit.CLUB) return $('#' + CLUBS);
    else return console.log('getFoundationStackWithSuit: Invalid suit integer');
  };

  Stack.equal = function(stack1, stack2) {
    return stack1.attr('id') === stack2.attr('id');
  };

  //---------- Suit ------------------------------------------------------------

  var Suit = {
    HEART: 1,
    SPADE: 2,
    DIAMOND: 3,
    CLUB: 4,

    toString : function(suit) {
      switch(parseInt(suit)) {
        case this.HEART:
          return 'hearts';
        case this.SPADE:
          return 'spades';
        case this.DIAMOND:
          return 'diamonds';
        case this.CLUB:
          return 'clubs';
        default:
          return 'Invalid suit integer';
      }
    },

    getColor : function(suit) {
      return ((suit === this.HEART) || (suit === this.DIAMOND)) ?
          Suit.Color.RED :
          Suit.Color.BLACK;
    },

    colorsMatch : function(suit1, suit2) {
      return Suit.getColor(parseInt(suit1)) == Suit.getColor(parseInt(suit2));
    },

    Color : {
      RED: 1,
      BLACK: 2
    }
  };

  //----------------------------------------------------------------------------

  $(document).ready(function(){
    init();
    $('#deal').click(function() {
      deal();
    });

    //$('#top-count').click(function() {
    //  console.log($(_TOP));
    //  alert("TOP COUNT: " + $(_TOP).length);
    //});

  });

})();
