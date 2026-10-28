import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardEvent, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, ScrollViewInstance, ScrollViewProps, TextInput } from 'react-native';

// Android is edge-to-edge (Expo SDK 54+), so the OS no longer resizes the window for the
// keyboard and KeyboardAvoidingView alone is not enough. We track the keyboard ourselves and
// scroll the focused input above it.

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

const focusListeners = new Set<() => void>();

/** Called by FormField when an input gains focus, so open scroll views can bring it into view. */
export function notifyInputFocused() {
  focusListeners.forEach(listener => listener());
}

export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event: KeyboardEvent) => setHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener(HIDE_EVENT, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * Bottom inset that keeps a bottom sheet inside a <Modal> above the keyboard.
 * On Android the Modal's own window already resizes for the keyboard, so adding the
 * keyboard height again would lift the sheet twice; only iOS needs the inset.
 */
export function useModalKeyboardInset() {
  const height = useKeyboardHeight();
  return Platform.OS === 'ios' ? height : 0;
}

type Props = ScrollViewProps & {
  /** Space to keep between the focused input and the top of the keyboard. */
  extraOffset?: number;
  /** Add keyboard-height padding below the content so the last fields can scroll above the keyboard. */
  padForKeyboard?: boolean;
};

const KeyboardAwareScrollView = forwardRef<ScrollViewInstance, Props>(function KeyboardAwareScrollView(
  { extraOffset = 24, padForKeyboard = true, contentContainerStyle, onScroll, children, ...props },
  ref,
) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const offsetRef = useRef(0);
  const keyboardTopRef = useRef<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useImperativeHandle(ref, () => scrollRef.current as ScrollViewInstance);

  const scrollToFocused = useCallback(() => {
    const keyboardTop = keyboardTopRef.current;
    const input = TextInput.State.currentlyFocusedInput?.();
    if (keyboardTop === null || !input) return;
    input.measureInWindow((_x, y, _width, height) => {
      const overlap = y + height + extraOffset - keyboardTop;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({ y: offsetRef.current + overlap, animated: true });
      }
    });
  }, [extraOffset]);

  useEffect(() => {
    // Give layout a moment to apply the keyboard padding (and any lifted sheet) before measuring.
    const scheduleScroll = () => setTimeout(scrollToFocused, Platform.OS === 'android' ? 80 : 0);

    const show = Keyboard.addListener(SHOW_EVENT, (event: KeyboardEvent) => {
      const { height, screenY } = event.endCoordinates;
      keyboardTopRef.current = screenY > 0 ? screenY : Dimensions.get('screen').height - height;
      setKeyboardHeight(height);
      scheduleScroll();
    });
    const hide = Keyboard.addListener(HIDE_EVENT, () => {
      keyboardTopRef.current = null;
      setKeyboardHeight(0);
    });
    // Moving between fields while the keyboard stays open does not fire a new show event on Android.
    const onFocus = () => scheduleScroll();
    focusListeners.add(onFocus);

    return () => {
      show.remove();
      hide.remove();
      focusListeners.delete(onFocus);
    };
  }, [scrollToFocused]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  return (
    <ScrollView
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      {...props}
      onScroll={handleScroll}
      contentContainerStyle={[contentContainerStyle, padForKeyboard && keyboardHeight ? { paddingBottom: keyboardHeight + extraOffset } : null]}
    >
      {children}
    </ScrollView>
  );
});

export default KeyboardAwareScrollView;
