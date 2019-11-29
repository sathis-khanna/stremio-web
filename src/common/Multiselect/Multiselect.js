const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('stremio-icons/dom');
const Button = require('stremio/common/Button');
const Popup = require('stremio/common/Popup');
const useBinaryState = require('stremio/common/useBinaryState');
const styles = require('./styles');

const Multiselect = ({ className, direction, title, options, selected, disabled, dataset, renderLabelContent, renderLabelText, onOpen, onClose, onSelect }) => {
    options = Array.isArray(options) ?
        options.filter(option => option && typeof option.value === 'string')
        :
        [];
    selected = Array.isArray(selected) ?
        selected.filter(value => typeof value === 'string')
        :
        [];
    const [menuOpen, openMenu, closeMenu, toggleMenu] = useBinaryState(false);
    const popupLabelOnClick = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented) {
            toggleMenu();
        }
    }, [toggleMenu]);
    const popupMenuOnClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnKeyDown = React.useCallback((event) => {
        event.nativeEvent.buttonClickPrevented = true;
    }, []);
    const optionOnClick = React.useCallback((event) => {
        if (typeof onSelect === 'function') {
            onSelect({
                type: 'select',
                value: event.currentTarget.dataset.value,
                reactEvent: event,
                nativeEvent: event.nativeEvent,
                dataset: dataset
            });
        }

        if (!event.nativeEvent.closeMenuPrevented) {
            closeMenu();
        }
    }, [onSelect, dataset]);
    React.useLayoutEffect(() => {
        if (menuOpen) {
            if (typeof onOpen === 'function') {
                onOpen({
                    type: 'open',
                    dataset: dataset
                });
            }
        } else {
            if (typeof onClose === 'function') {
                onClose({
                    type: 'close',
                    dataset: dataset
                });
            }
        }
    }, [menuOpen]);
    return (
        <Popup
            open={menuOpen}
            direction={direction}
            onCloseRequest={closeMenu}
            renderLabel={({ ref, className: popupLabelClassName, children }) => (
                <Button ref={ref} className={classnames(className, popupLabelClassName, styles['label-container'], { 'active': menuOpen })} title={title} disabled={disabled} onClick={popupLabelOnClick}>
                    {
                        typeof renderLabelContent === 'function' ?
                            renderLabelContent()
                            :
                            <React.Fragment>
                                <div className={styles['label']}>
                                    {
                                        typeof renderLabelText === 'function' ?
                                            renderLabelText()
                                            :
                                            selected.length > 0 ?
                                                options.reduce((labels, { label, value }) => {
                                                    if (selected.includes(value)) {
                                                        labels.push(typeof label === 'string' ? label : value);
                                                    }

                                                    return labels;
                                                }, []).join(', ')
                                                :
                                                title
                                    }
                                </div>
                                <Icon className={styles['icon']} icon={'ic_arrow_down'} />
                            </React.Fragment>
                    }
                    {children}
                </Button>
            )}
            renderMenu={() => (
                <div className={styles['menu-container']} onKeyDown={popupMenuOnKeyDown} onClick={popupMenuOnClick}>
                    {
                        options.length > 0 ?
                            options.map(({ label, value }) => {
                                const isSelected = selected.includes(value);
                                const title = typeof label === 'string' ? label : value;
                                return (
                                    <Button key={value} className={classnames(styles['option-container'], { 'selected': isSelected })} title={title} data-value={value} data-autofocus={isSelected ? true : null} onClick={optionOnClick}>
                                        <div className={styles['label']}>{title}</div>
                                        <Icon className={styles['icon']} icon={'ic_check'} />
                                    </Button>
                                )
                            })
                            :
                            <div className={styles['no-options-container']}>
                                <div className={styles['label']}>No options available</div>
                            </div>
                    }
                </div>
            )}
        />
    );
};

Multiselect.propTypes = {
    className: PropTypes.string,
    direction: PropTypes.any,
    title: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string
    })),
    selected: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    dataset: PropTypes.objectOf(String),
    renderLabelContent: PropTypes.func,
    renderLabelText: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onSelect: PropTypes.func
};

module.exports = Multiselect;
