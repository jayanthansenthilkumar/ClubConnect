package com.example.clubsconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/landing.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
        registry.addViewController("/clubconnect").setViewName("forward:/index.html");
        registry.addViewController("/member-login").setViewName("forward:/member-login.html");
        registry.addViewController("/member-portal").setViewName("forward:/member-portal.html");
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                String requestURI = request.getRequestURI();
                // Block direct access to HTML files (but allow forwarded requests)
                if (requestURI.endsWith(".html") && request.getAttribute("jakarta.servlet.forward.request_uri") == null) {
                    response.sendError(HttpServletResponse.SC_NOT_FOUND);
                    return false;
                }
                return true;
            }
        }).addPathPatterns("/**")
          .excludePathPatterns("/css/**", "/js/**", "/images/**", "/api/**", "/error");
    }
}
