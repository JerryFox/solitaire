(function() {

  // TODO: Comment the shit out of the code that is here...
  // TODO: And refactor code to make more readable while doing this.
  //       Move css code from drop to addToTopOf
  // TODO: Double click to add to foundation (in progress)
  //       Needs to verify the double click is not applied to cards it should
  //       not be. Only should be in top card in tab stacks
  //       Need to implement double click behavior.
  //       i.e. Get rank, validate against top of its fnd stack, and move or reject.
  //       I think stipping all event on removeFrom will help with this
  // TODO: Add win code and reset the deck after a win
  // TODO  Count moves
  // TODO: Allow user to choose their card back image
  // TODO: Add jquery ui touch punch and provide local copies of all dependancies
  // TODO: Loading... until all card resources have loaded
  // TODO: Units tests

  // Game element selectors
  var _STOCK = '#stock';
  var _WASTE = '#waste';
  var _HEARTS = '#hearts';
  var _SPADES = '#spades';
  var _DIAMONDS = '#diamonds';
  var _CLUBS = '#clubs';
  var _TAB1 = '#tableau-1';
  var _TAB2 = '#tableau-2';
  var _TAB3 = '#tableau-3';
  var _TAB4 = '#tableau-4';
  var _TAB5 = '#tableau-5';
  var _TAB6 = '#tableau-6';
  var _TAB7 = '#tableau-7';
  var _TOP = '.top-of-stack';
  var _BASE = '.stack-placeholder';

  // Ids and classes
  var ID_TAB = 'tableau';
  var ID_FND = 'foundation';
  var CL_TOP = 'top-of-stack';
  var CL_BASE = 'stack-placeholder';
  var CL_CARD_DRAGGED = 'card-being-dragged';

  // Card img data attributes
  var DATA_RANK = 'data-rank';
  var DATA_SUIT = 'data-suit';

  // Image paths
  var PLACEHOLDER_DEFAULT = 'img/placeholder-outline.svg';
  var PLACEHOLDER_EMPTY = 'img/placeholder-empty.svg';
  var PLACEHOLDER_STOCK = 'img/placeholder-stock.svg';
  var PLACEHOLDER_HEARTS = 'img/placeholder-hearts.svg';
  var PLACEHOLDER_SPADES = 'img/placeholder-spades.svg';
  var PLACEHOLDER_DIAMONDS = 'img/placeholder-diamonds.svg';
  var PLACEHOLDER_CLUBS = 'img/placeholder-clubs.svg';
  var CARD_BACK = 'img/back.svg';

  var gameInProgress = false;
  var cardImgZIndex = 1;

  //---------- Initialization --------------------------------------------------

  var init = function() {
    init.stacks();
    init.deck();
  };

  init.stacks = function() {
    init.stacks.appendElements();
    init.stacks.bindEvents();
  };

  init.stacks.appendElements = function() {
    DomBuilder.stackBase($(_STOCK), PLACEHOLDER_STOCK, CL_BASE);
    DomBuilder.stackBase($(_WASTE), PLACEHOLDER_EMPTY);
    DomBuilder.stackBase($(_HEARTS), PLACEHOLDER_HEARTS);
    DomBuilder.stackBase($(_SPADES), PLACEHOLDER_SPADES);
    DomBuilder.stackBase($(_DIAMONDS), PLACEHOLDER_DIAMONDS);
    DomBuilder.stackBase($(_CLUBS), PLACEHOLDER_CLUBS);
    var tabs = [$(_TAB1),$(_TAB2),$(_TAB3),$(_TAB4),$(_TAB5),$(_TAB6),$(_TAB7)];
    for (var i = 0; i < tabs.length; i++) {
      DomBuilder.stackBase(tabs[i], PLACEHOLDER_DEFAULT);
    }
  };

  init.stacks.bindEvents = function() {
    init.stacks.bindEvents.stockPlaceHolderClick();
    init.stacks.bindEvents.foundationPlaceholderDroppable();
    init.stacks.bindEvents.tableauPlaceholderDroppable();
  };

  init.stacks.bindEvents.stockPlaceHolderClick = function() {
    $(_STOCK).getPlaceholder().click(Click.emptyStock);
  };

  init.stacks.bindEvents.foundationPlaceholderDroppable = function() {
    var foundation = [$(_HEARTS), $(_SPADES), $(_DIAMONDS), $(_CLUBS)];
    for (var i = 0; i < foundation.length; i++) {
      foundation[i].getPlaceholder().droppable(Droppable.foundationPlaceholder);
    }
  };

  init.stacks.bindEvents.tableauPlaceholderDroppable = function() {
    var tabs = [$(_TAB1),$(_TAB2),$(_TAB3),$(_TAB4),$(_TAB5),$(_TAB6),$(_TAB7)];
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].getPlaceholder().droppable(Droppable.tableauPlaceholder);
    }
  };

  init.deck = function() {
    var cards = init.deck.shuffle(DomBuilder.cards());
    for (var i = 0; i < cards.length; i++) {
      init.deck.card(cards[i]);
    }
  };

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

  init.deck.card = function(card) {
    card.flipDown()
    card.css({
      'background-image': 'url(' + CARD_BACK + ')',
      'background-size': '100%',
      'background-repeat': 'no-repeat'
    });

    card.addToTopOf($(_STOCK));
  };

  init.deck.clear = function() {
    var stacks = [$(_STOCK),$(_WASTE),
                  $(_HEARTS),$(_SPADES),$(_DIAMONDS),$(_CLUBS),
                  $(_TAB1),$(_TAB2),$(_TAB3),$(_TAB4),$(_TAB5),$(_TAB6),$(_TAB7)];
    for (var i = 0; i < stacks.length; i++) {
      stacks[i].getAllCards().remove();
      stacks[i].children('div:first').addClass(CL_TOP);
    }
    cardImgZIndex = 1;
  };

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
      var card = $(_STOCK).getTopCard();
      if ( i==1 || i==8 || i==14 || i==19 || i==23 || i==26 || i==28 )
        card.flipUp();
      if ( i==1 )
        card.changeStack($(_STOCK), $(_TAB1));
      else if ( i==2 || i==8 )
        card.changeStack($(_STOCK), $(_TAB2));
      else if ( i==3 || i==9  || i==14 )
        card.changeStack($(_STOCK), $(_TAB3));
      else if ( i==4 || i==10 || i==15 || i==19 )
        card.changeStack($(_STOCK), $(_TAB4));
      else if ( i==5 || i==11 || i==16 || i==20 || i==23 )
        card.changeStack($(_STOCK), $(_TAB5));
      else if ( i==6 || i==12 || i==17 || i==21 || i==24 || i==26 )
        card.changeStack($(_STOCK), $(_TAB6));
      else if ( i==7 || i==13 || i==18 || i==22 || i==25 || i==27 || i==28 )
        card.changeStack($(_STOCK), $(_TAB7));
    }
  }

  //-----------

  var win = win || {};

  win.check = function() {
    var foundation = [$(_HEARTS), $(_SPADES), $(_DIAMONDS), $(_CLUBS)];
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
    var cardsInWaste = $(_WASTE).sizeOfStack();
    while (cardsInWaste > 0) {
      $(_WASTE).getTopCard().flipDown().changeStack($(_WASTE), $(_STOCK));
      cardsInWaste--;
    }
  };

  Click.cardInStock = function(event) {
    event.stopPropagation();
    event.preventDefault();
    if (gameInProgress) {
      var card = $(this)
      card.flipUp();
      card.changeStack($(_STOCK), $(_WASTE));
    }
  };

  Click.faceDownCardInTableau = function(event) {
    //
    //
    $(this).flipUp();
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
      $(this).getImg().addClass(CL_CARD_DRAGGED);
    },
    stop:   function(event, ui) {
      $(this).restoreFlexibility();
      $(this).getImg().removeClass(CL_CARD_DRAGGED);
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

  var Card = Card || {};

  jQuery.fn.changeStack = function(from, to) {
    var card = $(this).removeFrom(from);
    card.addToTopOf(to);
    return card;
  };

  jQuery.fn.addToTopOf = function(stack) {
    var parent = stack.find(_TOP);

    if (!gameInProgress)
      $(this).addClass(CL_TOP);

    parent.append($(this));
    parent.removeClass(CL_TOP);

    $(this).incrementNestedStackZIndex();

    if (stack.applyOffset() && stack.sizeOfStack() > 1)
      $(this).css({ 'position': 'absolute', 'top': '20%' });

    if (stack.is($(_STOCK))) {
      $(this).click(Click.cardInStock);

    } else if (stack.is($(_WASTE))) {

      $(this).draggable(Draggable.card);
      $(this).dblclick(Click.doubleClickTopCardInTableau);

    } else if ($(this).getStack().parent().attr('id') == ID_FND) {

      $(this).draggable(Draggable.card);
      $(this).droppable(Droppable.foundation);

      $(this).css({
        'position': 'absolute', 'top':'0', 'left': '0'
      });

      if ($(this).hasRank(13)) {
        win.check();
      }

    } else if ($(this).getStack().parent().attr('id') == ID_TAB) {

      if ($(this).isFaceUp() && !($(this).hasClass(CL_BASE))) {
        $(this).draggable(Draggable.card); // all cards in stack must be draggable
        $(this).droppable(Droppable.tableau);
        $(this).dblclick(Click.doubleClickTopCardInTableau);
      }

      if (parent.data('ui-droppable') && !parent.hasClass(CL_BASE)) {
        parent.droppable('destroy');
        parent.unbind('dblclick');
      }

    } else {
      console.log('addToTopOfStack: No matching stack found');
    }
    return $(this);
  };

  jQuery.fn.removeFrom = function(stack) {
    // TODO UNBIND ALL CLICK AND DRAG AND DROP EVENTS
    $(this).unbind('dblclick');
    $(this).unbind('click');

    var parent = $(this).parent();
    parent.addClass(CL_TOP);

    if (stack.parent().attr('id') == ID_TAB) {
      if (parent.isFaceUp() && !parent.hasClass(CL_BASE)) {
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
    if ($(this).parents(_STOCK).length > 0) return $(_STOCK);
    if ($(this).parents(_WASTE).length > 0) return $(_WASTE);
    if ($(this).parents(_HEARTS).length > 0) return $(_HEARTS);
    if ($(this).parents(_SPADES).length > 0) return $(_SPADES);
    if ($(this).parents(_DIAMONDS).length > 0) return $(_DIAMONDS);
    if ($(this).parents(_CLUBS).length > 0) return $(_CLUBS);
    if ($(this).parents(_TAB1).length > 0) return $(_TAB1);
    if ($(this).parents(_TAB2).length > 0) return $(_TAB2);
    if ($(this).parents(_TAB3).length > 0) return $(_TAB3);
    if ($(this).parents(_TAB4).length > 0) return $(_TAB4);
    if ($(this).parents(_TAB5).length > 0) return $(_TAB5);
    if ($(this).parents(_TAB6).length > 0) return $(_TAB6);
    if ($(this).parents(_TAB7).length > 0) return $(_TAB7);
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

  jQuery.fn.flipUp = function() {
    $(this).getImg().css('visibility', 'visible');
    return $(this);
  };

  jQuery.fn.flipDown = function() {
    $(this).getImg().css('visibility', 'hidden');
    return $(this);
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

  var Stack = Stack || {};

  jQuery.fn.incrementNestedStackZIndex = function(callback) {
    var that = $(this);
    while (that.length) {
      that.getImg().css('z-index', cardImgZIndex);
      cardImgZIndex++;
      that = that.children('div');
    }
  }

  jQuery.fn.getTopCard = function() {
    return $(this).find(_TOP);
  };

  jQuery.fn.getAllCards = function() {
    return $(this).find('div').not(_BASE);
  };

  jQuery.fn.getPlaceholder = function() {
    return $(this).children(_BASE);
  };

  jQuery.fn.sizeOfStack = function() {
    return $(this).getAllCards().length;
  };

  jQuery.fn.applyOffset = function() {
    var tabs = [$(_TAB1),$(_TAB2),$(_TAB3),$(_TAB4),$(_TAB5),$(_TAB6),$(_TAB7)];
    for (var i = 0; i < tabs.length; i++) {
      if (Stack.equal($(this), tabs[i])) return true;
    }
    return false;
  };

  Stack.getFoundationStackWithSuit = function(suit) {
    if (suit == Suit.HEART) return $(_HEARTS);
    if (suit == Suit.SPADE) return $(_SPADES);
    if (suit == Suit.DIAMOND) return $(_DIAMONDS);
    if (suit == Suit.CLUB) return $(_CLUBS);
    else return console.log('getFoundationStackWithSuit: Invalid suit integer');
  }

  Stack.equal = function(stack1, stack2) {
    return stack1.attr('id') === stack2.attr('id');
  };

  //---------- DomBuilder ------------------------------------------------------

  var DomBuilder = DomBuilder || {};

  DomBuilder.stackBase = function(parent, baseCardImgPath) {
    var stack = DomBuilder.div(parent);
    stack.addClass(CL_BASE);
    stack.addClass(CL_TOP);
    var img = DomBuilder.img(stack, baseCardImgPath);
    parent.append(stack);
    parent.removeClass(CL_TOP);
  }

  DomBuilder.cards = function() {
    var cards = [];
    for (var card = 1; card <= 52;) {
      for (var suit = 1; suit <= 4; suit++, card++) {
        cards[card - 1] = DomBuilder.card(Math.ceil(card / 4), suit);
      }
    }
    return cards;
  };

  DomBuilder.card = function(rank, suit) {
    var card = $('<div></div>');
    var filename = rank + '-' + Suit.toString(suit);
    var img = $('<img src="img/' + filename + '.svg" />');
    img.attr(DATA_RANK, rank);
    img.attr(DATA_SUIT, suit);
    card.append(img);
    return card;
  };

  DomBuilder.div = function(parent) {
    var div = $('<div></div>');
    parent.append(div);
    return div;
  };

  DomBuilder.img = function(parent, imgPath) {
    var img = $('<img src="' + imgPath + '" />');
    parent.append(img);
    return img;
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

    $('#top-count').click(function() {
      console.log($(_TOP));
      alert("TOP COUNT: " + $(_TOP).length);
    });

  });

})();
