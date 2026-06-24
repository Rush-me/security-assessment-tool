package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "isra_tracking")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IsraTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private IsraProject project;

    @Column(name = "tracking_iteration", nullable = false)
    private Integer trackingIteration;

    @Column(name = "tracking_date")
    private LocalDate trackingDate;

    @Column(name = "tracking_comment", columnDefinition = "TEXT")
    private String trackingComment;
}
