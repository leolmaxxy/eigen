#import <UIKit/UIKit.h>


@interface ARLoginButtonsView : UIView

@property (nonatomic, strong, readonly) UIButton *actionButton;
@property (nonatomic, strong, readonly) UIButton *appleButton;
@property (nonatomic, strong, readonly) UIButton *facebookButton;

- (void)setupForLoginWithLargeLayout:(BOOL)useLargeLayout; // includes forget password button
- (void)setupForSignUpWithLargeLayout:(BOOL)useLargeLayout; // includes back button
- (void)setupForThirdPartyLoginsWithLargeLayout:(BOOL)useLargeLayout; // includes back button

@end
