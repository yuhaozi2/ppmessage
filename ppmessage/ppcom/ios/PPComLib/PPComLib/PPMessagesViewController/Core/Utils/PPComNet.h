//
//  PPComLibNet.h
//  PPComDemo
//
//  Created by Kun Zhao on 9/16/15.
//  Copyright (c) 2015 Yvertical. All rights reserved.
//

#import <Foundation/Foundation.h>
@class PPCom;

@protocol PPComNetDelegate<NSObject>

- (void) onSuccess:(NSDictionary*)response;

// on error callback
@optional
- (void) onError:(NSError*)error;

@end

@interface PPComNet : NSObject

@property (readonly) NSString *host;
@property (readonly) NSString *appKey;
@property (readonly) NSString *appSecret;
@property (readonly) NSString *apiHost;
@property (readonly) NSString *webSocketHost;
@property (readonly) NSString *fileDownloadHost;
@property (readonly) NSString *fileUploadHost;
@property (readonly) NSString *portalHost;

/**
 * init with PPCom client
 */
- (instancetype) initWithClient:(PPCom*)client;

/**
 * init with PPCom client
 */
+ (instancetype) netWithClient:(PPCom*)client;

// post data in async mode
- (void) asyncPost: (NSDictionary*) data urlSegment:(NSString*)url delegate:(id<PPComNetDelegate>)theDelegate;

// post data in async mode, and responsed with block
- (void) asyncPost:(NSDictionary *)data urlSegment:(NSString *)url completionHandler:(void(^)(NSDictionary* response, NSError* error))handler;

// post data in sync mode, this will block main thread
- (NSDictionary*) post: (NSDictionary*) data urlSegment:(NSString*)url;

// request data in sync mode
- (NSData*) request:(NSString*)url;

// request data in async mode
- (void) asyncRequest:(NSString*)url withBlock:(void(^)(NSError *error, NSData *data))handler;

@end
