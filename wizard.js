// page: User:Yuvipanda/wizard/wizard.js
( function() { 
    var cssPath = '//en.wikipedia.org/w/index.php?title=User:Yuvipanda/wizard/wizard.css&action=raw&ctype=text/css';

    function Wizard( $wizard ) {
        var curStep;

        var inputs = {};

        var that = this;
        function handleAction() {
            var $button = $( this );
            switch( $button.attr( 'data-wizard-type' ) ) {
                case 'move-step':
                    that.showStep( $button.attr( 'data-wizard-step' ) );
                    break;
                case 'validate-move-step':
                    that.validateStep( curStep, $button.attr( 'data-wizard-step' ) );
                    break;
                case 'submit':
                    var toPage = $wizard.attr( 'data-wizard-submit-to' );
                    var nextStep = $button.attr( 'data-wizard-step' );
                    var progressStep = $button.attr( 'data-wizard-progress-step' );
                    that.submit( toPage, progressStep ).done( function( data ) {
                        that.showStep( nextStep );
                    } );
                    break;
                case 'back':
                    that.goBack();
                    break;
            }
            return false;
        }
        function setupActions() {
            addDefaultActions();
            $wizard.find( 'ul[data-wizard-type="action-buttons"] li, ul[data-wizard-type="action-list"] li' ).each( function( i, li ) {
                var $li = $( li );
                var attrs = {};
                // $li.attr() doesn't return map :(
                $.each($li[ 0 ].attributes, function( index, attr ) {
                    attrs[ attr.name ] = attr.value;
                }); 
                var $link = $( '<a />' )
                        .attr( 'href', '#' )
                        .attr( attrs )
                        .html( $li.html() )
                        .click( handleAction );
                $li.empty().append( $link );
            } );
            $wizard.find( 'ul[data-wizard-type="action-buttons"] li a' ).addClass( 'button' );
        }

        function addDefaultActions() {
            $wizard.find( 'ul[data-wizard-type="action-list"], ul[data-wizard-type="action-buttons"]' )
                .addClass( "transformed-lists" )
                .find( "li" ).each( function() {
                    if( !$( this ).is( '[data-wizard-type]' ) ) {
                        $( this ).attr( 'data-wizard-type', 'move-step' );
                    }
                } );
        }

        function substituteOutputs( $stepDiv ) {
            $stepDiv.find( 'span[data-wizard-type="output"]' ).each( function( i, span ) { 
                var $span = $( span );
                $span.text( inputs[ $span.attr( 'data-wizard-input-name' ) ].val() );
            } );
        }

        function setupInputs() {
            $wizard.find( 'span[data-wizard-type="input"]' ).each( function( i, span ) {
                var $span = $( span );
                var $input;
                var $wrapper;
                switch( $span.attr( 'data-wizard-input-type' ) ) {
                    case 'textarea':
                        $input = $( '<textarea />' ).attr( {
                            rows: $span.attr( 'data-wizard-input-textarea-rows' ) || 6,
                            cols: $span.attr( 'data-wizard-input-textarea-columns' ) || 60
                        } );
                        $wrapper = $( '<div> </div>' ).append( $input );
                        var maxLength = $span.attr( 'data-wizard-input-maxlength' );
                        if( maxLength ) {
                            var $charCounter = $( '<div> </div>' )
                                        .addClass( 'mw-wizard-charcounter')
                                        .text( '0 / ' + maxLength );
                            $input.on( 'keypress keydown keyup mouseup', function() {
                                $charCounter.text( $input.val().length + ' / ' + maxLength );
                            } );
                            $wrapper.append( $charCounter );
                        }
                        break;
                    case 'text':
                        $input = $( '<input />' ).attr( {
                            type: 'text'
                        } );
                        $wrapper = $( '<div> </div>' ).append( $input );
                        break;
                }
                $input.attr( {
                    maxlength: $span.attr( 'data-wizard-input-maxlength'),
                    name: $span.attr( 'data-wizard-input-name' )
                } );
                if( $input.attr( 'data-wizard-input-validation' ) !== 'optional' ) {
                    // By default all inputs are required.
                    $input.attr( 'required', 'required' );
                }
                $span.replaceWith( $wrapper );
                var inputName = $input.attr( 'name' );
                if( that.options.inputDefaults[ inputName ] ) {
                    $input.val( that.options.inputDefaults[ inputName ]() );
                }
                inputs[ $input.attr( 'name' ) ] = $input;
            } );
        }

        function showInitialStep() {
            $wizard.children( 'div[data-wizard-step-name]' ).hide();
            // Using that here feels weird.
            // TODO: Checkout proper convention for using these kinda private functions in js
            that.showStep( $wizard.attr( 'data-wizard-initial' ) );
        }

        this.showStep = function( step, options ) {
            options = options || {};
            if( curStep !== undefined ) {
                var $curDiv = $wizard.children( 'div[data-wizard-step-name="' + curStep + '"]' );
                $curDiv.hide();
            }

            var $stepDiv = $wizard.children( 'div[data-wizard-step-name="' + step + '"]' );
            substituteOutputs( $stepDiv );
            $stepDiv.show( 'fast' );
            if( !options.skipHistory ) {
                $stepDiv.data( 'prev-parent', curStep );
            }

            curStep = step;
        };

        this.goBack = function() {
            var $stepDiv = $wizard.children( 'div[data-wizard-step-name="' + curStep + '"]' );
            if( typeof $stepDiv.data( 'prev-parent' ) !== 'undefined' ) {
                this.showStep( $stepDiv.data( 'prev-parent' ), { skipHistory: true } );
            }
        };

        this.validateStep = function( checkStep, nextStep ) {
            var $stepDiv = $wizard.children( 'div[data-wizard-step-name="' + checkStep + '"]' );
            var allValid = true;
            $stepDiv.find( 'input[type="text"], textarea').each( function( i, input ) {
                var $input = $( input );
                if( $input.attr( 'required' ) === 'required' ) {
                    if( $.trim( $input.val() ) === '' ) {
                        allValid = false;
                        $input.addClass( 'mw-wizard-validation-failed' );
                    } else {
                        $input.removeClass( 'mw-wizard-validation-failed' );
                    }
                }
            } );

            if( allValid ) {
                this.showStep( nextStep );
            } else {
            }

        };

        this.getData = function() {
            var data = {};
            $.each( inputs, function( name, $input ) {
                data[ name ] = $input.val();
            } );
            
            return data;
        };

        this.submit = function( toPage, progressStep ) {
            var d = $.Deferred();
            var data = this.getData();
            var sectionText = this.options.getSectionText( data );
            var sectionTitle = this.options.getSectionTitle( data );
            var editSummary = this.options.getEditSummary( data );
            var editToken = mw.user.tokens.get( 'editToken' );
            var api = new mw.Api();

            this.showStep( progressStep );

            api.post( {
                action: 'edit',
                title: toPage,
                section: 'new',
                sectiontitle: sectionTitle,
                text: sectionText,
                summary: editSummary,
                token: editToken
            } ).done( function( data ) {
                if( data && data.edit && data.edit.result === 'Success' ) {
                    // Yay, we succeeded!
                    d.resolve(); 
                } else {
                    d.reject( data );
                }
            } ).fail( function( data ) {
                d.reject( data );
            } );
            return d;
        };

        var defaultOptions = {
            inputDefaults: {}
        };

        this.initialize = function( options ) {
            this.options = $.extend( defaultOptions, options );
            showInitialStep();
            setupActions();
            setupInputs();
        };

        this.loadWizardCode = function() {
            var script = $wizard.attr( 'data-wizard-script' );
            importScript( script );
        };
    }

    $( function() {
        if( $( '.mw-wizard' ).length ) {
            mw.loader.load( cssPath, "text/css" );
            mw.loader.using( [ 'mediawiki.user' ], function() {
                mw.wizard = new Wizard( $( '.mw-wizard' ) );
                mw.wizard.loadWizardCode();
            } );
        }
    } );
} )();
